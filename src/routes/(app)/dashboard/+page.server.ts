import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, grades, subject, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { avg, desc, eq, sql } from "drizzle-orm";

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
		const leaderboard = await db
			.select({
				userId: user.id,
				fullname: user.fullname,
				score: avg(enrollment.score),
				avatar: user.avatar,
				gradeLevel: grades.level,
				totalSubjects: sql<number>`COUNT(DISTINCT ${subject.id})`, // Total subjects enrolled
			})
			.from(enrollment)
			.innerJoin(user, eq(enrollment.userId, user.id))
			.innerJoin(subject, eq(enrollment.subjectId, subject.id))
			.innerJoin(grades, eq(subject.gradesId, grades.id))
			.groupBy(user.id, user.fullname, user.avatar, grades.level) // Group by user only
			.where(eq(enrollment.schoolId, schoolId))
			.orderBy(desc(avg(enrollment.score)));

		return { quote: quoteData, leaderboard };
	}
	return redirect(302, "/signin");
};
