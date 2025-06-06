import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { getDb } from "$lib/server/db";
import * as table from "$lib/schema/db";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const subjectList = await db.select().from(table.subject);
		return {
			subjectList,
			user: event.locals.user,
		};
	}
	return redirect(302, "/login");
};
