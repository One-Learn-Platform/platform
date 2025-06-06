import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

import { getDb } from "$lib/server/db";
import { eq, and } from "drizzle-orm";
import * as table from "$lib/schema/db";

export const load: PageServerLoad = async (event) => {
	const { slug } = event.params;
	const params = slug;
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const subject = await db
			.select()
			.from(table.subject)
			.where(
				and(eq(table.subject.code, params), eq(table.subject.schoolId, event.locals.user.school)),
			)
			.get();
		if (!subject) {
			return error(404, "Subject not found");
		}
		return { subject };
	}
	return redirect(302, "/signin");
};
