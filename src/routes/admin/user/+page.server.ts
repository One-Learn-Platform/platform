import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";

import { getDb } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const userList = await db.select().from(table.user);
	const schoolList = await db.select().from(table.school);
	const roleList = await db.select().from(table.userRole);
	if (event.locals.user) {
		return {
			user: event.locals.user,
			role: event.locals.user.role,
			userList: userList,
			schoolList: schoolList,
			roleList: roleList,
			form: await superValidate(zod(formSchema)),
		};
	}
	return {
		userList: userList,
		schoolList: schoolList,
		roleList: roleList,
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const db = getDb(event);

		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			console.log(form);
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
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
				return fail(400, { form });
			}
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
