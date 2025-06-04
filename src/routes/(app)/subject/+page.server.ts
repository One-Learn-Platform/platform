import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { getDb } from "$lib/server/db";
import * as table from "$lib/schema/db";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && (event.locals.user.role === 0 || event.locals.user.role === 1)) {
		const db = getDb(event);
		const subjectList = await db.select().from(table.subject);
		return {
			subjectList,
			user: event.locals.user,
		};
	}
	return redirect(303, "/login");
};
