import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, `/subject/${event.params.subjectCode}/${event.params.chapter}/material/1`);
	}
	return redirect(302, "/signin");
};
