import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { assignment, submission, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, desc, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const schoolId = event.locals.user.school;

		if (!schoolId) {
			return error(400, "School ID is required");
		}
		const quote = await fetch("https://api.api-ninjas.com/v1/advice", {
			headers: {
				"X-Api-Key": "cbz9iWrhpOZb3ohLKPatVg==FQoNN8wxRV7vat5I",
			},
		});
		const quoteData = (await quote.json()) as { advice: string };
		console.log(quoteData);
		const submissionsColumn = getTableColumns(submission);
		const leaderboard = await db
			.select({
				...submissionsColumn,
				userId: user.id,
				avatar: user.avatar,
				fullname: user.fullname,
				assignmentId: assignment.id,
			})
			.from(submission)
			.innerJoin(user, eq(submission.userId, user.id))
			.innerJoin(assignment, eq(submission.assignmentId, assignment.id))
			.where(and(eq(submission.schoolId, schoolId)))
			.orderBy(desc(submission.score));
		return { leaderboard, quote: quoteData };
	}
	return redirect(302, "/signin");
};
