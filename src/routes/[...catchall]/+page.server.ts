import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/signin");
};
