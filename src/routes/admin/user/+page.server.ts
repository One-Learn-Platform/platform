import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

import bcryptjs from "bcryptjs";
import { setError, superValidate, fail, withFiles } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchemaCreate } from "$lib/schema/user/schema";

import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import * as table from "$lib/server/db/schema";
import { eq, getTableColumns, or } from "drizzle-orm";
import { getFileName, getTimeStamp } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const { password, ...rest } = getTableColumns(table.user);
	const userList = await db.select({ ...rest }).from(table.user);
	const schoolList = await db.select().from(table.school);
	const roleList = await db.select().from(table.userRole);
	if (event.locals.user) {
		return {
			user: event.locals.user,
			role: event.locals.user.role,
			userList: userList,
			schoolList: schoolList,
			roleList: roleList,
			form: await superValidate(zod(formSchemaCreate)),
		};
	}
	return error(404, { message: "Not found" });
};

export const actions: Actions = {
	create: async (event) => {
		const db = getDb(event);
		const form = await superValidate(event, zod(formSchemaCreate));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}
		try {
			const existingUser = await db
				.select()
				.from(table.user)
				.where(eq(table.user.username, form.data.username));
			if (existingUser.at(0)) {
				setError(form, "username", "Username already exists");
				return fail(400, {
					create: { success: false, data: null, message: "Username already exists" },
					form,
				});
			}
			const passwordHash = await bcryptjs.hash(form.data.password, 10);
			let roleId = 0;
			switch (form.data.role) {
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
					return fail(500, {
						create: { success: false, data: null, message: "Failed to upload file" },

						form,
					});
				}
			}
			const imageUrl = (await getR2(event).get(uniqueFileName))?.key;

			await db.insert(table.user).values({
				roleId: roleId,
				avatar: imageUrl,
				fullname: form.data.name,
				dob: form.data.dob,
				username: form.data.username,
				password: passwordHash,
			});
		} catch (error) {
			console.error(error);
			setError(form, "", "Database error, please try again", { status: 500 });
			return fail(500, {
				create: { success: false, data: null, message: "Database error, please try again" },
				form,
			});
		}

		return withFiles({
			create: {
				success: true,
				data: {
					name: form.data.name,
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
			const name = await db.select().from(table.user).where(eq(table.user.id, numberId));
			await db.delete(table.user).where(eq(table.user.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: name[0].fullname,
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
					message: "Database Connection error, please try again.",
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
			.from(table.user)
			.where(or(...idArray.map((id) => eq(table.user.id, id))));
		const userNameArray = userArray.map((user) => user.fullname);

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			try {
				await db.delete(table.user).where(eq(table.user.id, id));
			} catch (error) {
				console.error(error);
				return fail(500, {
					delete: {
						success: false,
						data: null,
						message: "Database Connection error, please try again.",
					},
				});
			}
		});

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					name: userNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
