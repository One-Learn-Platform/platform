import type { Actions, PageServerLoad } from "./$types";
import { fail, error } from "@sveltejs/kit";

import { superValidate, setError } from "sveltekit-superforms";
import { formSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";

import * as table from "$lib/server/db/schema";
import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const roleList = await db.select().from(table.userRole);
	return {
		user: event.locals.user,
		role: event.locals.user?.role,
		roleList: roleList,
		form: await superValidate(zod(formSchema)),
	};
	// return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	default: async (event) => {
		const db = getDb(event);
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				form,
			});
		}

		try {
			await db.insert(table.userRole).values({
				name: form.data.roleName,
			});
		} catch (error) {
			setError(form, "", "Database error, please try again", { status: 500 });
			console.error(error);
			return fail(500, { form });
		}

		return {
			form,
		};
	},
};
