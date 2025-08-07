import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			return redirect(302, "/admin");
		}
		return redirect(302, "/dashboard");
	}
	return {};
};
