import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (event) => {
	if (event.locals.user && (event.locals.user.role === 0 || event.locals.user.role === 1)) {
		return {
			user: event.locals.user,
			session: event.locals.session,
		};
	}
	return error(404, { message: "Not Found" });
};
