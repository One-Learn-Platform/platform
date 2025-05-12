import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";

import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchemaEdit } from "$lib/schema/user/schema";

import { eq } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import * as table from "$lib/server/db/schema";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const userId = parseInt(slug, 10);

	if (!event.locals.user || (event.locals.user.role !== 0 && event.locals.user.role !== 1)) {
		return error(404, { message: "Not Found" });
	} else if (isNaN(userId)) {
		return error(400, { message: "Invalid User ID" });
	} else {
		const user = await db.select().from(table.user).where(eq(table.user.id, userId)).get();
		if (user) {
			user.password = "";
			return {
				userData: user,
				form: await superValidate(zod(formSchemaEdit)),
			};
		} else {
			return error(404, { message: "User Not Found" });
		}
	}
	// return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const userId = parseInt(slug, 10);
		const form = await superValidate(event, zod(formSchemaEdit), {
			id: "edit",
		});
		const formData = form.data;

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		let roleId = 0;
		switch (formData.role) {
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

		const prevUserData = (await db.select().from(table.user).where(eq(table.user.id, userId))).at(
			0,
		);
		if (!prevUserData) return fail(404, { message: "User not found" });

		if (prevUserData.username !== formData.username) {
			try {
				const existingUser = await db
					.select()
					.from(table.user)
					.where(eq(table.user.username, formData.username));
				if (existingUser.at(0)) {
					setError(form, "username", "Username already exists");
					return fail(400, {
						edit: { success: false, data: null, message: "Username already exists" },
						form,
					});
				}
			} catch (error) {
				console.error(error);
				setError(form, "", "Database error, please try again", { status: 500 });
				return fail(500, {
					edit: { success: false, data: null, message: "Database error, please try again" },
					form,
				});
			}
		}

		try {
			await db
				.update(table.user)
				.set({
					fullname: formData.name,
					username: formData.username,
					dob: formData.dob,
					roleId: roleId,
				})
				.where(eq(table.user.id, userId));
		} catch (error) {
			console.error(error);
			setError(form, "", "Database error, please try again", { status: 500 });
			return fail(500, {
				edit: { success: false, data: null, message: "Database error, please try again" },
				form,
			});
		}
		if (event.url.searchParams.has("ref")) redirect(303, "/admin/user");
		return {
			edit: {
				success: true,
				data: {
					name: formData.name,
				},
				message: "User created successfully",
			},
			form,
		};
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
};
