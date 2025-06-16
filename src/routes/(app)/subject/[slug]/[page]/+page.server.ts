import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { subject, subjectType, forum, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const slug = event.params.slug;
	const page = Number(event.params.page);
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		if (isNaN(page) || page < 1) {
			return error(400, "Invalid chapter");
		}
		const db = getDb(event);
		const columns = getTableColumns(subject);
		const subjectData = await db
			.select({ ...columns, subjectTypeName: subjectType.name })
			.from(subject)
			.where(and(eq(subject.code, slug), eq(subject.schoolId, event.locals.user.school)))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.get();
		if (!subjectData) {
			return error(404, "Subject not found");
		}
		const forumColumns = getTableColumns(forum);
		const forumList = await db
			.select({ ...forumColumns, fullname: user.fullname, avatar: user.avatar })
			.from(forum)
			.where(
				and(
					eq(forum.schoolId, event.locals.user.school),
					eq(forum.subjectId, subjectData.id),
					eq(forum.chapter, page),
				),
			)
			.leftJoin(user, eq(forum.userId, user.id));
		return { forum: forumList };
	}
	return redirect(302, "/signin");
};
