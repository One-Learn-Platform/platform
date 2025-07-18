import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

import {
	assignment,
	assignmentQuestion,
	enrollment,
	subject,
	submission,
	user,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 3) {
			const db = getDb(event);
			const { subjectCode } = event.params;
			const chapter = Number(event.params.chapter);
			const id = Number(event.params.id);
			const schoolId = Number(event.locals.user.school);
			if (!schoolId || isNaN(schoolId)) {
				return error(400, "Invalid school");
			}
			if (!subjectCode) {
				return error(400, "Invalid subject code");
			}
			if (isNaN(chapter) || chapter < 1) {
				return error(400, "Invalid chapter");
			}
			if (isNaN(id) || id < 1) {
				return error(400, "Invalid assignment ID");
			}

			const currentSubject = await db
				.select()
				.from(subject)
				.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
				.get();
			if (!currentSubject) {
				return error(404, "Subject not found");
			}

			const currentAssignment = await db
				.select()
				.from(assignment)
				.where(eq(assignment.id, id))
				.get();
			if (!currentAssignment) {
				return error(404, "Assignment not found");
			}

			const questionList = await db
				.select()
				.from(assignmentQuestion)
				.where(eq(assignmentQuestion.assignmentId, currentAssignment.id));

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...userColumns } = getTableColumns(user);
			const { id: submissionId, ...submissionColumns } = getTableColumns(submission);

			const userList = await db
				.select({
					...userColumns,
					enrollmentScore: enrollment.score,
					enrolledAt: enrollment.createdAt,
					submissionId,
					...submissionColumns,
				})
				.from(enrollment)
				.innerJoin(user, eq(enrollment.userId, user.id))
				.leftJoin(
					submission,
					and(
						eq(submission.assignmentId, currentAssignment.id),
						eq(submission.userId, enrollment.userId),
					),
				)
				.where(eq(enrollment.subjectId, currentSubject.id));

			return {
				currentSubject,
				currentAssignment,
				userList,
				questionList,
			};
		}
		return error(404, "Not Found");
	}
	return redirect(302, "/signin");
};
