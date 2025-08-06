import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaWithPass } from "$lib/schema/user/schema";
import bcrypt from "bcryptjs";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import {
	comment,
	enrollment,
	forum,
	grades,
	school,
	session,
	subject,
	submission,
	user,
	userRole,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";
import { eq, getTableColumns, inArray, not, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			// eslint-disable-next-line
			const { password, ...rest } = getTableColumns(user);
			const schoolList = await db.select().from(school);
			let roleList;
			if (event.locals.user.role !== 1) {
				roleList = await db
					.select()
					.from(userRole)
					.where(not(eq(userRole.id, 1)));
			} else {
				roleList = await db.select().from(userRole);
			}
			const gradesList = await db.select().from(grades);

			let userList;
			if (event.locals.user.school) {
				userList = await db
					.select({ ...rest, schoolName: school.name, gradeLevel: grades.level })
					.from(user)
					.where(eq(user.schoolId, event.locals.user.school))
					.leftJoin(school, eq(user.schoolId, school.id))
					.leftJoin(grades, eq(user.gradesId, grades.id));
			} else {
				userList = await db
					.select({ ...rest, schoolName: school.name })
					.from(user)
					.leftJoin(school, eq(user.schoolId, school.id));
			}
			return {
				gradesList: gradesList,
				userList: userList,
				schoolList: schoolList,
				roleList: roleList,
				form: await superValidate(zod4(formSchemaWithPass)),
			};
		} else {
			return error(404, { message: "Not found" });
		}
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.user || (event.locals.user.role !== 1 && event.locals.user.role !== 2)) {
			return error(403, { message: "You are not allowed to create a user" });
		}
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchemaWithPass));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.username, form.data.username))
			.get();
		if (existingUser) {
			setError(form, "username", "Username already exists");
			return fail(400, {
				create: { success: false, data: null, message: "Username already exists" },
				form,
			});
		}
		const passwordHash = await bcrypt.hash(form.data.password, 12);
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

		const uniqueFileName = `user/avatar/${getFileName(form.data.username)}-${getTimeStamp()}.png`;
		if (form.data.avatar) {
			const fileBuffer = await form.data.avatar.arrayBuffer();
			try {
				await getR2(event).put(uniqueFileName, fileBuffer, {
					httpMetadata: {
						contentType: form.data.avatar.type,
					},
				});
			} catch (r2Error) {
				console.error("Failed to upload to R2:", r2Error);
				setError(form, "avatar", r2Error instanceof Error ? r2Error.message : "R2 upload error");
				return fail(500, {
					create: {
						success: false,
						data: null,
						message: r2Error instanceof Error ? r2Error.message : "R2 upload error",
					},
					form,
				});
			}
		}
		const imageUrl = (await getR2(event).get(uniqueFileName))?.key;
		const schoolId =
			event.locals.user.role === 1 ? Number(form.data.schoolId) : Number(event.locals.user.school);
		if (roleId !== 1 && !schoolId) {
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
		if (!schoolId || isNaN(schoolId) || schoolId <= 0) {
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
		try {
			if (roleId === 4) {
				await db.insert(user).values({
					roleId: roleId,
					avatar: imageUrl,
					fullname: form.data.fullname,
					dob: form.data.dob,
					username: form.data.username,
					gradesId: form.data.gradesId ? Number(form.data.gradesId) : null,
					password: passwordHash,
					schoolId: schoolId,
				});
			} else {
				await db.insert(user).values({
					roleId: roleId,
					avatar: imageUrl,
					fullname: form.data.fullname,
					dob: form.data.dob,
					username: form.data.username,
					password: passwordHash,
					schoolId: schoolId,
				});
			}
		} catch (error) {
			await getR2(event).delete(uniqueFileName);
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Database Connection error, please try again.",
				{ status: 500 },
			);
			return fail(500, {
				create: {
					success: false,
					data: null,
					message:
						error instanceof Error ? error.message : "Database Connection error, please try again.",
				},
				form,
			});
		}

		return withFiles({
			create: {
				success: true,
				data: {
					fullname: form.data.fullname,
				},
				message: "User created successfully",
			},
			form,
		});
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
		const name = await db.select().from(user).where(eq(user.id, numberId)).get();
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
					message:
						error instanceof Error ? error.message : "Database Connection error, please try again.",
				},
			});
		}
		return {
			delete: {
				success: true,
				data: {
					id: numberId,
					fullname: name.fullname,
				},
				message: null,
			},
		};
	},
	multidelete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const ids = formData.get("ids");
		const idArray = ids
			?.toString()
			.split(",")
			.map((id) => Number(id));

		if (!idArray) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}

		const userArray = await db
			.select()
			.from(user)
			.where(or(...idArray.map((id) => eq(user.id, id))));
		const userNameArray = userArray.map((user) => user.fullname);

		for (const id of idArray) {
			if (isNaN(id) || id <= 0) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			const userExists = userArray.some((user) => user.id === id);
			if (!userExists) {
				return fail(404, {
					delete: {
						success: false,
						data: null,
						message: `User with ID ${id} not found. Please try again.`,
					},
				});
			}
		}
		const isTeacher = await db.select().from(subject).where(inArray(subject.teacher, idArray));
		if (isTeacher.length > 0) {
			return fail(400, {
				delete: {
					success: false,
					data: null,
					message: `User is teacher and still assigned to ${isTeacher.map((t) => t.name).join(", ")}. Please remove the teacher from the subject first.`,
				},
			});
		}
		const allForum = await db.select().from(forum).where(inArray(forum.userId, idArray));
		const allComment = await db
			.select()
			.from(comment)
			.where(
				inArray(
					comment.forumId,
					allForum.map((f) => f.id),
				),
			);
		try {
			await db.delete(submission).where(inArray(submission.userId, idArray));
			await db.delete(comment).where(inArray(comment.userId, idArray));
			await db.delete(comment).where(
				inArray(
					comment.id,
					allComment.map((c) => c.id),
				),
			);
			await db.delete(forum).where(inArray(forum.userId, idArray));
			await db.delete(enrollment).where(inArray(enrollment.userId, idArray));
			await db.delete(session).where(inArray(session.userId, idArray));
			await db.delete(user).where(inArray(user.id, idArray));
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error, please try again.",
				},
			});
		}

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					fullname: userNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
