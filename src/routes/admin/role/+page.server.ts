import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

import { superValidate, setError } from "sveltekit-superforms";
import { formSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";

import * as table from "$lib/server/db/schema";
import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const roleList = await db.select().from(table.userRole);
	if (event.locals.user) {
		return {
			user: event.locals.user,
			role: event.locals.user?.role,
			roleList: roleList,
			form: await superValidate(zod(formSchema)),
		};
	}
	return {
		user: event.locals.user,
		roleList: roleList,
		form: await superValidate(zod(formSchema)),
	};
	// return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	create: async (event) => {
		const db = getDb(event);
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		try {
			await db.insert(table.userRole).values({
				name: form.data.roleName,
			});
			return {
				create: { success: true, data: { name: form.data.roleName }, message: null },
				form,
			};
		} catch (error) {
			console.error(error);
			setError(form, "", "Database error, please try again", { status: 500 });
			return fail(500, {
				create: { success: false, data: null, message: "Database error, please try again" },
				form,
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
			const name = await db.select().from(table.userRole).where(eq(table.userRole.id, numberId));
			await db.delete(table.userRole).where(eq(table.userRole.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: name[0].name,
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
