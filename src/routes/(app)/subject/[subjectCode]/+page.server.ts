import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const { subjectCode } = event.params;
	if (event.locals.user) {
		return redirect(302, `/subject/${subjectCode}/1`);
	}
	return redirect(302, "/signin");
};
