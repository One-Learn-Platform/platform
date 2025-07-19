import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, subject, subjectType, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, desc, eq, exists, getTableColumns, sql } from "drizzle-orm";

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
				missed: sql<number>`CASE 
                WHEN ${assignment.dueDate} < datetime('now') 
                AND NOT ${exists(
									db
										.select()
										.from(submission)
										.where(
											and(
												eq(submission.assignmentId, assignment.id),
												eq(submission.userId, event.locals.user.id),
											),
										),
								)}
                THEN 1 
                ELSE 0 
            END`,
			})
			.from(assignment)
			.where(and(eq(assignment.subjectId, currentSubject.id)))
			.innerJoin(subject, eq(assignment.subjectId, subject.id))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.orderBy(desc(assignment.createdAt));
		return {
			subject: currentSubject,
			assignments: assignmentList,
		};
	}
	return redirect(302, "/signin");
};
