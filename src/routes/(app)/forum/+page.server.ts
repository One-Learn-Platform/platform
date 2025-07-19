import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, forum, subject, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const schoolId = Number(event.locals.user.school);
		if (isNaN(schoolId) || schoolId <= 0) {
			return error(400, "Invalid school ID");
		}
		const forumColumns = getTableColumns(forum);
		const isTeacher = event.locals.user.role === 3;
		const allForums = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
				subjectCode: subject.code,
				teacher: subject.teacher,
			})
			.from(forum)
			.innerJoin(user, eq(forum.userId, user.id))
			.innerJoin(subject, eq(forum.subjectId, subject.id))
			.innerJoin(enrollment, eq(enrollment.subjectId, subject.id))
			.where(
				and(
					eq(forum.schoolId, schoolId),
					isTeacher
						? eq(enrollment.userId, event.locals.user.id)
						: eq(subject.teacher, event.locals.user.id),
				),
			);

		return {
			forums: allForums,
		};
	}
	return redirect(302, "/signin");
};
