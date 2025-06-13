import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaWithPass } from "$lib/schema/user/schema";
import bcryptjs from "bcryptjs";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { school, user, userRole, session } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";
import { eq, getTableColumns, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			// eslint-disable-next-line
			const { password, ...rest } = getTableColumns(user);
			const schoolList = await db.select().from(school);
			const roleList = await db.select().from(userRole);
			let userList;
			if (event.locals.user.school) {
				userList = await db
					.select({ ...rest, schoolName: school.name })
					.from(user)
					.where(eq(user.schoolId, event.locals.user.school))
					.leftJoin(school, eq(user.schoolId, school.id));
			} else {
				userList = await db
					.select({ ...rest, schoolName: school.name })
					.from(user)
					.leftJoin(school, eq(user.schoolId, school.id));
			}
			return {
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
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchemaWithPass));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}
		const existingUser = await db.select().from(user).where(eq(user.username, form.data.username)).get();
		if (existingUser) {
			setError(form, "username", "Username already exists");
			return fail(400, {
				create: { success: false, data: null, message: "Username already exists" },
				form,
			});
		}
		const passwordHash = await bcryptjs.hash(form.data.password, 10);
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
		const schoolId = form.data.schoolId ? Number(form.data.schoolId) : null;
		try {
			await db.insert(user).values({
				roleId: roleId,
				avatar: imageUrl,
				fullname: form.data.fullname,
				dob: form.data.dob,
				username: form.data.username,
				password: passwordHash,
				schoolId: schoolId,
			});
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
		try {
			const name = await db.select().from(user).where(eq(user.id, numberId));
			await db.delete(user).where(eq(user.id, numberId));
			await db.delete(session).where(eq(session.userId, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						fullname: name[0].fullname,
					},
					message: null,
				},
			};
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

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			try {
				await db.delete(user).where(eq(user.id, id));
				await db.delete(session).where(eq(session.userId, id));
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
		});

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
