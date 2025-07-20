import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, subject, subjectType, grades } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	event.depends("app:selectedGrade");
	if (event.locals.user) {
		const db = getDb(event);
		const columns = getTableColumns(subject);
		const isAdmin = event.locals.user.role === 1 || event.locals.user.role === 2;
		const isTeacher = event.locals.user.role === 3;
		const isStudent = event.locals.user.role === 4;
		let subjectList;
		if (event.locals.user.school) {
			if (isAdmin) {
				subjectList = await db
					.select({ ...columns, subjectTypeName: subjectType.name, gradesLevel: grades.level })
					.from(subject)
					.innerJoin(grades, eq(subject.gradesId, grades.id))
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
					.where(eq(subject.schoolId, event.locals.user.school));
			} else if (isTeacher) {
				subjectList = await db
					.select({ ...columns, subjectTypeName: subjectType.name, gradesLevel: grades.level })
					.from(subject)
					.innerJoin(grades, eq(subject.gradesId, grades.id))
					.where(
						and(
							eq(subject.schoolId, event.locals.user.school),
							eq(subject.teacher, event.locals.user.id),
						),
					)
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id));
			} else if (isStudent) {
				const selectedGrade = Number(event.cookies.get("selectedGrade"));
				subjectList = await db
					.select({ ...columns, subjectTypeName: subjectType.name, gradesLevel: grades.level })
					.from(subject)
					.innerJoin(grades, eq(subject.gradesId, grades.id))
					.innerJoin(enrollment, eq(enrollment.subjectId, subject.id))
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
					.where(and(eq(enrollment.userId, event.locals.user.id), eq(grades.level, selectedGrade)));
			}
		}
		return {
			subjectList,
			user: event.locals.user,
		};
	}
	return redirect(302, "/signin");
};
