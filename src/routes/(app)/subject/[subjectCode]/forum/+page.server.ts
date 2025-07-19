import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { forum, subject, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const { subjectCode } = event.params;
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const currentSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!currentSubject) {
			return error(404, "Subject not found");
		}
		const forumColumns = getTableColumns(forum);
		const forumList = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
				subjectCode: subject.code,
			})
			.from(forum)
			.innerJoin(user, eq(forum.userId, user.id))
			.innerJoin(subject, eq(forum.subjectId, subject.id))
			.where(eq(forum.subjectId, currentSubject.id));
		return {
			subject: currentSubject,
			forum: forumList,
		};
	}
	return redirect(302, "/signin");
};
