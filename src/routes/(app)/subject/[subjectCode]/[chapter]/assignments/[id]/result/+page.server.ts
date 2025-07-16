import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, assignmentQuestion, submission } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const id = Number(event.params.id);
		const { subjectCode, chapter } = event.params;
		const db = getDb(event);

		const currentSubmission = await db
			.select()
			.from(submission)
			.where(and(eq(submission.assignmentId, id), eq(submission.userId, event.locals.user.id)))
			.get();
		const allQuestions = await db
			.select()
			.from(assignmentQuestion)
			.where(eq(assignmentQuestion.assignmentId, id));
		const currentAssignment = await db.select().from(assignment).where(eq(assignment.id, id)).get();
		if (!currentSubmission) {
			return redirect(302, `/subject/${subjectCode}/${chapter}/assignments/${id}/start`);
		}
		return {
			params: { subjectCode, chapter },
			submission: currentSubmission,
			questions: allQuestions,
			assignment: currentAssignment,
		};
	}
	return redirect(302, "/signin");
};
