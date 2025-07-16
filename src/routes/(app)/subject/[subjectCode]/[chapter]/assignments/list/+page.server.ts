import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { user, submission } from "$lib/schema/db";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 3) {
			const db = getDb();
		}
		return error(404, "Not Found");
	}
	return redirect(302, "/login");
};
