import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { subject, subjectType } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const columns = getTableColumns(subject);
		let subjectList;
		if (event.locals.user.school) {
			subjectList = await db
				.select({ ...columns, subjectTypeName: subjectType.name })
				.from(subject)
				.where(eq(subject.schoolId, event.locals.user.school))
				.innerJoin(subjectType, eq(subject.subjectType, subjectType.id));
		}
		return {
			subjectList,
			user: event.locals.user,
		};
	}
	return redirect(302, "/signin");
};
