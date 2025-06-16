import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const params = event.params.slug;
	if (event.locals.user) {
		return redirect(302, `/subject/${params}/1`);
	}
	return redirect(302, "/signin");
};
