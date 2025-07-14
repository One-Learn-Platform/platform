import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { assignment, assignmentQuestion, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const { page, id } = event.params;
		const assignmentId = Number(id);
		const chapter = Number(page);
		if (event.locals.user.role !== 4) {
			return error(404, "Not Found");
		}
		if (isNaN(assignmentId) || isNaN(chapter)) {
			return error(400, "Invalid assignment or chapter ID");
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
		const { page, id, slug } = event.params;
		const assignmentId = Number(id);
		const chapter = Number(page);
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
		try {
			await db.insert(submission).values({
				userId: event.locals.user.id,
				assignmentId: assignmentId,
				schoolId: schoolId,
				score: score,
				content: JSON.stringify(processedFormData),
			});
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
		return redirect(303, `/subject/${slug}/${chapter}/assignments/${assignmentId}`);
	},
};
