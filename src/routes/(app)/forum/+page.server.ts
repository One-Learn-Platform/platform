import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { forum, user, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const schoolId = Number(event.locals.user.school);
		if (isNaN(schoolId) || schoolId <= 0) {
			return error(400, "Invalid school ID");
		}
		const forumColumns = getTableColumns(forum);
		const allForums = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
				subjectCode: subject.code,
			})
			.from(forum)
			.where(eq(forum.schoolId, schoolId))
			.innerJoin(user, eq(forum.userId, user.id))
			.innerJoin(subject, eq(forum.subjectId, subject.id));
		return {
			forums: allForums,
		};
	}
	return redirect(302, "/signin");
};
