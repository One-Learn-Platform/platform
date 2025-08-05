import { error, redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import {
	assignment,
	assignmentQuestion,
	enrollment,
	forum,
	material,
	subject,
	subjectType,
	submission,
	user,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, exists, getTableColumns, sql, count } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const { subjectCode } = event.params;
	const chapter = Number(event.params.chapter);
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		const db = getDb(event);
		const subjectColumns = getTableColumns(subject);
		const subjectData = await db
			.select({ ...subjectColumns, subjectTypeName: subjectType.name })
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, event.locals.user.school)))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.get();
		if (!subjectData) {
			return error(404, "Subject not found");
		}
		const assignmentColumns = getTableColumns(assignment);
		const quiz = await db
			.select()
			.from(assignment)
			.where(and(eq(assignment.quiz, true), eq(assignment.subjectId, subjectData.id)))
			.get();
		let questions;
		let isLimit = false;
		let isSubmitted = false;
		if (quiz) {
			const quizSubmission = await db
				.select({ count: count() })
				.from(submission)
				.where(eq(submission.assignmentId, quiz.id))
				.get();
			const quizSubmissionUser = await db
				.select()
				.from(submission)
				.where(
					and(eq(submission.assignmentId, quiz.id), eq(submission.userId, event.locals.user.id)),
				)
				.get();
			const submissionCount = quizSubmission?.count ?? 0;
			isSubmitted = quizSubmissionUser !== undefined;
			isLimit = submissionCount >= (quiz.limitUser ?? 0);
			if (!isLimit) {
				questions = await db
					.select()
					.from(assignmentQuestion)
					.where(eq(assignmentQuestion.assignmentId, quiz.id));
			}
		}
		const assignmentList = await db
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
			.where(eq(assignment.subjectId, subjectData.id));
		const forumColumns = getTableColumns(forum);
		const forumList = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
				subjectCode: subject.code,
			})
			.from(forum)
			.where(
				and(
					eq(forum.schoolId, event.locals.user.school),
					eq(forum.subjectId, subjectData.id),
					eq(forum.chapter, chapter),
				),
			)
			.innerJoin(user, eq(forum.userId, user.id))
			.innerJoin(subject, eq(forum.subjectId, subject.id));
		const materialColumns = getTableColumns(material);
		const materialList = await db
			.select({ ...materialColumns })
			.from(material)
			.where(
				and(
					eq(material.schoolId, event.locals.user.school),
					eq(material.subjectId, subjectData.id),
					eq(material.chapter, chapter),
				),
			);
		return {
			quiz: isLimit || isSubmitted ? undefined : quiz,
			questions,
			forum: forumList,
			material: materialList,
			assignment: assignmentList,
		};
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	submit: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/login");
		}
		const db = getDb(event);
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		const schoolId = event.locals.user.school;

		const formData = await event.request.formData();
		const id = formData.get("quiz_id");
		const assignmentId = Number(id);
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
			const { id: submissionId, ...submissionColumns } = getTableColumns(submission);
			const beforeSubmissions = await db
				.select({
					...getTableColumns(assignment),
					submissionId,
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
			const beforeOvrScore = beforeSubmissions.reduce((acc, sub) => acc + (sub.score ?? 0), 0);
			const beforeAvgScore =
				beforeSubmissions.length > 0 ? beforeOvrScore / beforeSubmissions.length : 0;
			await db.insert(submission).values({
				userId: event.locals.user.id,
				assignmentId: assignmentId,
				schoolId: schoolId,
				score: score,
				content: JSON.stringify(processedFormData),
			});

			const allSubmissions = await db
				.select({
					...getTableColumns(assignment),
					submissionId,
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
			if (assignmentData.quiz && averageScore > beforeAvgScore) {
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
			}
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
		return {
			submit: {
				success: true,
				message: "Quiz submitted successfully.",
			},
		};
	},
};
