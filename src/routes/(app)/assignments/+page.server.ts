import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, enrollment, subject, subjectType, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, desc, eq, exists, getTableColumns, sql } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const schoolId = event.locals.user.school;
		if (isNaN(schoolId) || schoolId < 0) {
			return error(400, "Invalid school");
		}
		const assignmentColumns = getTableColumns(assignment);
		const isTeacher = event.locals.user.role === 3;

		const allAssignments = await db
			.select({
				...assignmentColumns,
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
			.innerJoin(subject, eq(assignment.subjectId, subject.id))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.innerJoin(enrollment, eq(enrollment.subjectId, subject.id))
			.where(
				and(
					eq(assignment.schoolId, schoolId),
					isTeacher
						? eq(enrollment.userId, event.locals.user.id)
						: eq(subject.teacher, event.locals.user.id),
				),
			)
			.orderBy(desc(assignment.createdAt));

		return { assignments: allAssignments };
	}
	return redirect(302, "/signin");
};
