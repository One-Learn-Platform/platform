import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, subject, subjectType } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const columns = getTableColumns(subject);
		let subjectList;
		if (event.locals.user.school) {
			if (event.locals.user.role === 3) {
				subjectList = await db
					.select({ ...columns, subjectTypeName: subjectType.name })
					.from(subject)
					.where(
						and(
							eq(subject.schoolId, event.locals.user.school),
							eq(subject.teacher, event.locals.user.id),
						),
					)
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id));
			} else if (event.locals.user.role === 4) {
				subjectList = await db
					.select({ ...columns, subjectTypeName: subjectType.name })
					.from(subject)
					.innerJoin(enrollment, eq(enrollment.subjectId, subject.id))
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
					.where(eq(enrollment.userId, event.locals.user.id));
			}
		}
		return {
			subjectList,
			user: event.locals.user,
		};
	}
	return redirect(302, "/signin");
};
