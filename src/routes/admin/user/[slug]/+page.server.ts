import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaUploadImage, formSchemaWithoutPass } from "$lib/schema/user/schema";
import { eq } from "drizzle-orm";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { school, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const userId = parseInt(slug, 10);

	if (event.locals.user && (event.locals.user.role === 1 || event.locals.user.role === 2)) {
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
	}
	return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	edit: async (event) => {
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
			return fail(404, { message: "User not found" });
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
			return fail(500, {
				create: { success: false, data: null, message: "Failed to upload file" },

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
		try {
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
			await db.delete(user).where(eq(user.id, numberId));
			redirect(303, "/admin/user");
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
};
