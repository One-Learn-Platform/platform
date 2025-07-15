import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, subject, subjectType, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, desc, eq, getTableColumns, exists, sql } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const { slug, page } = event.params;
		const school = event.locals.user.school;
		if (!school) {
			return error(400, "Not associated with a school");
		}
		const subjectCode = slug;
		const chapter = Number(page);

		if (isNaN(chapter) || chapter <= 0) {
			return error(400, "Invalid chapter number");
		}
		const selectedSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, school)))
			.get();
		if (!selectedSubject) {
			return error(404, "Subject not found");
		}
		const assignmentColumn = getTableColumns(assignment);

		const assignmentList = await db
			.select({
				...assignmentColumn,
				subject: subject.name,
				subjectCode: subject.code,
				subjectType: subjectType.name,
				done: sql<number>`${exists(
					db
						.select()
						.from(submission)
						.where(
							and(
								eq(submission.assignmentId, assignment.id),
								eq(submission.userId, event.locals.user.id),
							),
						),
				)}`,
			})
			.from(assignment)
			.where(
				and(
					eq(assignment.subjectId, selectedSubject.id),
					eq(assignment.chapter, chapter),
					eq(assignment.schoolId, school),
				),
			)
			.innerJoin(subject, eq(assignment.subjectId, subject.id))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.orderBy(desc(assignment.createdAt));
		return { assignmentList };
	}
	return redirect(302, "/signin");
};
