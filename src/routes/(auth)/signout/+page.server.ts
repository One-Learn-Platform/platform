import type { Actions, PageServerLoad } from "./$types";

import { eq } from "drizzle-orm";

import { session } from "$lib/schema/db";
import * as auth from "$lib/server/auth";
import { getDb } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/signin");
	}
	return redirect(302, "/");
};

export const actions: Actions = {
	signout: async (event) => {
		const db = getDb(event);
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event, event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		await db.delete(session).where(eq(session.id, event.locals.session.id));

		return redirect(302, "/signin");
	},
};
