import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

import { grades, school, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, inArray } from "drizzle-orm";

export const load: LayoutServerLoad = async (event) => {
	event.depends("app:selectedGrade");
	if (event.locals.user) {
		const selectedGrade = event.cookies.get("selectedGrade");
		const db = getDb(event);
		const currentUser = await db.select().from(user).where(eq(user.id, event.locals.user.id)).get();
		if (!currentUser) {
			return redirect(302, "/signin");
		}
		let gradesList;
		if (currentUser.gradesId !== null) {
			const grade = await db.select().from(grades).where(eq(grades.id, currentUser.gradesId)).get();
			if (grade && grade.level === 12) {
				gradesList = await db
					.select()
					.from(grades)
					.where(inArray(grades.level, [12, 11, 10]));
			} else if (grade && grade.level === 11) {
				gradesList = await db
					.select()
					.from(grades)
					.where(inArray(grades.level, [11, 10]));
			} else if (grade && grade.level === 10) {
				gradesList = await db.select().from(grades).where(eq(grades.level, 10));
			} else {
				gradesList = await db.select().from(grades);
			}
		} else {
			gradesList = await db.select().from(grades);
		}
		if (currentUser.schoolId === null) {
			return redirect(302, "/signin");
		}
		const currentSchool = await db
			.select()
			.from(school)
			.where(eq(school.id, currentUser.schoolId))
			.get();
		if (!currentSchool) {
			return redirect(302, "/signin");
		}
		return {
			user: event.locals.user,
			session: event.locals.session,
			selectedGrade,
			grades: gradesList,
			school: currentSchool,
		};
	}
	return redirect(302, "/");
};
