import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			return {};
		} else {
			return error(404, { message: "Not Found" });
		}
	}
	return redirect(302, "/signin");
};
