import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (event) => {
	if (event.locals.user && (event.locals.user.role === 0 || event.locals.user.role === 1)) {
		return {
			user: event.locals.user,
			session: event.locals.session,
		};
	}
	return redirect(302, "/signin");
};
