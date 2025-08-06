import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { classroom, enrollment, grades, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { avg, desc, eq } from "drizzle-orm";

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
			})
			.from(enrollment)
			.innerJoin(user, eq(enrollment.userId, user.id))
			.innerJoin(classroom, eq(enrollment.classroomId, classroom.id))
			.innerJoin(grades, eq(classroom.gradesId, grades.id))
			.groupBy(user.id, user.fullname, user.avatar, grades.level) // Group by user only
			.where(eq(enrollment.schoolId, schoolId))
			.orderBy(desc(avg(enrollment.score)));

		return { quote: quoteData, leaderboard };
	}
	return redirect(302, "/signin");
};
