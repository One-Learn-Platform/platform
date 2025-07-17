import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, enrollment, subject, submission, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 3) {
			const db = getDb(event);
			const schoolId = Number(event.locals.user.school);
			const { subjectCode } = event.params;
			const chapter = Number(event.params.chapter);
			if (isNaN(schoolId) || schoolId < 1) {
				return error(400, "School ID is required");
			}
			if (!subjectCode || subjectCode.trim() === "") {
				return error(400, "Invalid subject code");
			}
			if (isNaN(chapter) || chapter < 1) {
				return error(400, "Invalid chapter number");
			}
			const currentSubject = await db
				.select()
				.from(subject)
				.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
				.get();
			if (!currentSubject) {
				return error(404, "Subject not found");
			}
			const assignmentsList = await db
				.select()
				.from(assignment)
				.where(
					and(
						eq(assignment.subjectId, currentSubject.id),
						eq(assignment.chapter, chapter),
						eq(assignment.schoolId, schoolId),
					),
				);
			const { id: submissionId, ...submissionColumn } = getTableColumns(submission);
			const assignmentColumn = getTableColumns(assignment);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id: userId, password, ...userColumn } = getTableColumns(user);
			const submissionsList = await db
				.select({
					submissionId,
					...submissionColumn,
					...assignmentColumn,
					userId,
					...userColumn,
					enrollmentScore: enrollment.score,
					enrolledAt: enrollment.createdAt,
				})
				.from(enrollment)
				.innerJoin(user, eq(enrollment.userId, user.id))
				.innerJoin(assignment, eq(assignment.subjectId, enrollment.subjectId))
				.leftJoin(
					submission,
					and(eq(submission.assignmentId, assignment.id), eq(submission.userId, enrollment.userId)),
				)
				.where(and(eq(enrollment.subjectId, currentSubject.id), eq(assignment.chapter, chapter)));
			return {
				params: event.params,
				subject: currentSubject,
				assignments: assignmentsList,
				submissions: submissionsList,
			};
		}
		return error(404, "Not Found");
	}
	return redirect(302, "/login");
};
