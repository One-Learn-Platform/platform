import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaUploadImage, formSchemaWithoutPass } from "$lib/schema/user/schema";
import { eq, inArray } from "drizzle-orm";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import {
	comment,
	enrollment,
	forum,
	school,
	session,
	subject,
	submission,
	user,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const userId = parseInt(slug, 10);

	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			if (isNaN(userId)) {
				return error(400, { message: "Invalid User ID" });
			} else {
				const userData = await db.select().from(user).where(eq(user.id, userId)).get();
				const schoolList = await db.select().from(school);
				if (userData) {
					userData.password = "";
					return {
						userData: userData,
						schoolList: schoolList,
						form: await superValidate(zod4(formSchemaWithoutPass)),
						uploadForm: await superValidate(zod4(formSchemaUploadImage)),
					};
				} else {
					return error(404, { message: "User Not Found" });
				}
			}
		} else {
			return error(404, { message: "Not Found" });
		}
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	edit: async (event) => {
		if (!event.locals.user || (event.locals.user.role !== 1 && event.locals.user.role !== 2)) {
			return error(403, { message: "You are not allowed to edit a user" });
		}
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const userId = parseInt(slug, 10);
		const form = await superValidate(event, zod4(formSchemaWithoutPass), {
			id: "edit",
		});

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		let roleId = 0;
		switch (form.data.roleId) {
			case "super admin":
				roleId = 1;
				break;
			case "admin":
				roleId = 2;
				break;
			case "teacher":
				roleId = 3;
				break;
			case "student":
				roleId = 4;
				break;
			default:
				break;
		}
		if (roleId === 0) {
			setError(form, "roleId", "Invalid role selected");
			return fail(400, {
				create: { success: false, data: null, message: "Invalid role selected" },
				form,
			});
		}
		if (roleId === 1 && event.locals.user.role !== 1) {
			setError(form, "roleId", "You are not allowed to create a super admin user");
			return fail(403, {
				create: {
					success: false,
					data: null,
					message: "You are not allowed to create a super admin user",
				},
				form,
			});
		}
		if (roleId !== 1 && !form.data.schoolId) {
			setError(form, "schoolId", "School is required");
			return fail(400, {
				create: {
					success: false,
					data: null,
					message: "School is required",
				},
				form,
			});
		}

		const prevUserData = await db.select().from(user).where(eq(user.id, userId)).get();
		if (!prevUserData) return fail(404, { message: "User not found" });

		if (prevUserData.username !== form.data.username) {
			try {
				const existingUser = await db
					.select()
					.from(user)
					.where(eq(user.username, form.data.username));
				if (existingUser.at(0)) {
					setError(form, "username", "Username already exists");
					return fail(400, {
						edit: { success: false, data: null, message: "Username already exists" },
						form,
					});
				}
			} catch (error) {
				console.error(error);
				setError(
					form,
					"",
					error instanceof Error ? error.message : "Unknown error. Please try again.",
					{ status: 500 },
				);
				return fail(500, {
					edit: {
						success: false,
						data: null,
						message: error instanceof Error ? error.message : "Unknown error. Please try again.",
					},
					form,
				});
			}
		}

		try {
			await db
				.update(user)
				.set({
					fullname: form.data.fullname,
					username: form.data.username,
					schoolId: form.data.schoolId ? Number(form.data.schoolId) : undefined,
					dob: form.data.dob,
					roleId: roleId,
				})
				.where(eq(user.id, userId));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				edit: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}
		if (event.url.searchParams.has("ref")) redirect(303, "/admin/user");
		return {
			edit: {
				success: true,
				data: {
					fullname: form.data.fullname,
				},
				message: "User created successfully",
			},
			form,
		};
	},

	upload: async (event) => {
		const db = getDb(event);
		const r2 = getR2(event);
		const params = event.params;
		const { slug } = params;
		const userId = parseInt(slug, 10);
		const form = await superValidate(event, zod4(formSchemaUploadImage));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				upload: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}
		const prevUserData = await db.select().from(user).where(eq(user.id, userId)).get();
		if (!prevUserData) {
			setError(form, "", "User not found");
			return fail(404, { upload: { success: false, data: null, message: "User not found" }, form });
		}
		const uniqueFileName = `user/avatar/${getFileName(prevUserData?.username)}-${getTimeStamp()}.png`;
		const fileBuffer = await form.data.avatar.arrayBuffer();
		try {
			await r2.put(uniqueFileName, fileBuffer, {
				httpMetadata: {
					contentType: form.data.avatar.type,
				},
			});
		} catch (r2Error) {
			console.error("Failed to upload to R2:", r2Error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				upload: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}
		const imageUrl = (await getR2(event).get(uniqueFileName))?.key;

		try {
			await db
				.update(user)
				.set({
					avatar: imageUrl,
				})
				.where(eq(user.id, userId));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				upload: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}
		if (event.url.searchParams.has("ref")) redirect(303, "/admin/user");
		return withFiles({
			upload: {
				success: true,
				data: {
					fullname: prevUserData?.fullname,
					avatar: imageUrl,
				},
				message: "Avatar updated successfully",
			},
			form,
		});
	},
	deleteAvatar: async (event) => {
		const db = getDb(event);
		const r2 = getR2(event);
		const formData = await event.request.formData();
		const id = formData.get("avatarId");

		if (!id) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}
		const numberId = Number(id);
		if (isNaN(numberId)) {
			return fail(400, {
				delete: { success: false, data: null, message: "ID is not a number. Please try again." },
			});
		}
		const prevUserData = await db.select().from(user).where(eq(user.id, numberId)).get();
		if (!prevUserData) {
			return fail(404, {
				delete: {
					success: false,
					data: null,
					message: "User not found. Please try again.",
				},
			});
		}
		if (prevUserData.avatar === null || prevUserData.avatar === "") {
			return fail(400, {
				delete: {
					success: false,
					data: null,
					message: "User does not have an avatar to delete.",
				},
			});
		}

		try {
			await r2.delete(prevUserData.avatar);
		} catch (error) {
			console.error("Failed to delete avatar from R2:", error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}

		try {
			await db
				.update(user)
				.set({
					avatar: null,
				})
				.where(eq(user.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						fullname: prevUserData.fullname,
					},
					message: "Avatar deleted successfully",
				},
			};
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}
	},
	delete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const id = formData.get("id");

		if (!id) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}
		const numberId = Number(id);
		if (isNaN(numberId)) {
			return fail(400, {
				delete: { success: false, data: null, message: "ID is not a number. Please try again." },
			});
		}
		const allForum = await db.select().from(forum).where(eq(forum.userId, numberId));
		const allComment = await db
			.select()
			.from(comment)
			.where(
				inArray(
					comment.forumId,
					allForum.map((f) => f.id),
				),
			);
		const isTeacher = await db.select().from(subject).where(eq(subject.teacher, numberId));
		if (isTeacher.length > 0) {
			return fail(400, {
				delete: {
					success: false,
					data: null,
					message: `User is teacher and still assigned to ${isTeacher.map((t) => t.name).join(", ")}. Please remove the teacher from the subject first.`,
				},
			});
		}
		const selectName = await db.select().from(user).where(eq(user.id, numberId));
		const name = selectName.at(0);
		if (!name) {
			return fail(404, {
				delete: {
					success: false,
					data: null,
					message: "User not found. Please try again.",
				},
			});
		}
		try {
			await db.delete(submission).where(eq(submission.userId, numberId));
			await db.delete(comment).where(eq(comment.userId, numberId));
			await db.delete(comment).where(
				inArray(
					comment.id,
					allComment.map((c) => c.id),
				),
			);
			await db.delete(forum).where(eq(forum.userId, numberId));
			await db.delete(enrollment).where(eq(enrollment.userId, numberId));
			await db.delete(session).where(eq(session.userId, numberId));
			await db.delete(user).where(eq(user.id, numberId));
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}
		redirect(303, "/admin/user");
	},
};
