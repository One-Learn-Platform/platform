import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { assignment, assignmentQuestion, enrollment, subject, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, exists, getTableColumns, sql } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const { id } = event.params;
		const chapter = Number(event.params.chapter);
		const assignmentId = Number(id);
		if (event.locals.user.role !== 4) {
			return error(404, "Not Found");
		}
		if (isNaN(assignmentId) || isNaN(chapter)) {
			return error(400, "Invalid assignment or chapter ID");
		}
		const assignmentColumns = getTableColumns(assignment);
		const assignmentData = await db
			.select({
				...assignmentColumns,
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
			.where(eq(assignment.id, assignmentId))
			.get();
		if (!assignmentData) {
			return error(404, "Assignment not found");
		}
		const dueDate = assignmentData.dueDate + "Z";
		if (dueDate && new Date(dueDate).getTime() < Date.now()) {
			return error(403, "This assignment is already closed");
		}
		if (assignmentData.done === 1) {
			return error(403, "You have already submitted this assignment");
		}

		const questions = await db
			.select()
			.from(assignmentQuestion)
			.where(eq(assignmentQuestion.assignmentId, assignmentId));
		if (!questions || questions.length === 0) {
			return error(404, "No questions found for this assignment, Please contact your teacher.");
		}
		return {
			assignment: assignmentData,
			questions,
		};
	}
	return redirect(302, "/login");
};

export const actions: Actions = {
	submit: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/login");
		}
		const db = getDb(event);
		const { id, subjectCode } = event.params;
		const assignmentId = Number(id);
		const chapter = Number(event.params.chapter);
		const schoolId = event.locals.user.school;

		if (isNaN(assignmentId) || isNaN(chapter)) {
			return error(400, "Invalid assignment or chapter ID");
		}
		if (!schoolId) {
			return error(400, "Invalid school ID");
		}
		const assignmentData = await db
			.select()
			.from(assignment)
			.where(eq(assignment.id, assignmentId))
			.get();
		if (!assignmentData) {
			return error(404, "Assignment not found");
		}

		const questions = await db
			.select()
			.from(assignmentQuestion)
			.where(eq(assignmentQuestion.assignmentId, assignmentId));
		const formData = await event.request.formData();
		let score = 0;
		for (const question of questions) {
			const answer = formData.get(`q-${question.id}`);
			if (question.answer === answer) {
				score++;
			}
		}
		score = Math.round((score / questions.length) * 100);
		console.log(`Total score: ${score}`);
		const processedFormData = Object.fromEntries(
			Array.from(formData.entries()).map(([key, value]) => [Number(key.replace("q-", "")), value]),
		);

		const selectedSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!selectedSubject) {
			return error(404, "Subject not found");
		}

		try {
			await db.insert(submission).values({
				userId: event.locals.user.id,
				assignmentId: assignmentId,
				schoolId: schoolId,
				score: score,
				content: JSON.stringify(processedFormData),
			});
			const assignmentColumns = getTableColumns(assignment);
			const submissionColumns = getTableColumns(submission);
			const allSubmissions = await db
				.select({
					...assignmentColumns,
					...submissionColumns,
				})
				.from(submission)
				.innerJoin(assignment, eq(submission.assignmentId, assignment.id))
				.where(
					and(
						eq(assignment.subjectId, selectedSubject.id),
						eq(submission.userId, event.locals.user.id),
					),
				);
			const overallScore = allSubmissions.reduce((acc, sub) => acc + (sub.score ?? 0), 0);
			const averageScore = allSubmissions.length > 0 ? overallScore / allSubmissions.length : 0;
			await db
				.update(enrollment)
				.set({
					score: averageScore,
				})
				.where(
					and(
						eq(enrollment.userId, event.locals.user.id),
						eq(enrollment.subjectId, selectedSubject.id),
					),
				);
		} catch (error) {
			console.error("Error inserting submission:", error);
			return fail(500, {
				submit: {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An error occurred while submitting the assignment.",
				},
			});
		}
		return redirect(303, `/subject/${subjectCode}/${chapter}/assignments/${assignmentId}/finish`);
	},
};
