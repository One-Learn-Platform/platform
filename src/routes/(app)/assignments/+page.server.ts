import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, subject, subjectType, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { desc, eq, getTableColumns, sql, and, exists } from "drizzle-orm";

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
			.where(eq(assignment.schoolId, schoolId))
			.innerJoin(subject, eq(assignment.subjectId, subject.id))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.orderBy(desc(assignment.createdAt));

		return { assignments: allAssignments };
	}
	return redirect(302, "/signin");
};
