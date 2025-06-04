import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && (event.locals.user.role === 0 || event.locals.user.role === 1)) {
		return {};
	}
	return error(404, { message: "Not Found" });
};
