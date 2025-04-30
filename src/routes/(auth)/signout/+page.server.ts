import type { Actions, PageServerLoad } from "./$types";

import * as auth from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/signin");
	}
	return redirect(302, "/");
};

export const actions: Actions = {
	signout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event, event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, "/signin");
	},
};
