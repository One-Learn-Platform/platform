import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";

import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "../schema";

import { eq } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import * as table from "$lib/schema/db";

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
		const role = await db.select().from(table.userRole).where(eq(table.userRole.id, userId)).get();
		if (role) {
			return {
				roleData: role,
				form: await superValidate(zod(formSchema)),
			};
		} else {
			return error(404, { message: "Role Not Found" });
		}
	}
	// return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const roleId = parseInt(slug, 10);
		const form = await superValidate(event, zod(formSchema), {
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

		const prevRoleData = (
			await db.select().from(table.userRole).where(eq(table.userRole.id, roleId))
		).at(0);
		if (!prevRoleData)
			return fail(404, { edit: { success: false, data: null, message: "Role not found" }, form });

		try {
			await db
				.update(table.userRole)
				.set({
					name: formData.roleName,
				})
				.where(eq(table.userRole.id, roleId));
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
		else {
			return {
				edit: {
					success: true,
					data: {
						name: formData.roleName,
					},
					message: "User created successfully",
				},
				form,
			};
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
			const selectName = await db.select().from(table.user).where(eq(table.user.id, numberId));
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
			await db.delete(table.userRole).where(eq(table.userRole.id, numberId));
			redirect(303, "/admin/role");
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
