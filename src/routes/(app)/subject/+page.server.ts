import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { grades, schedule, subject, subjectType, teacherAssign } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, exists, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	event.depends("app:selectedGrade");
	if (event.locals.user) {
		const db = getDb(event);
		const subjectColumns = getTableColumns(subject);
		const isAdmin = event.locals.user.role === 1 || event.locals.user.role === 2;
		const isTeacher = event.locals.user.role === 3;
		const isStudent = event.locals.user.role === 4;
		let subjectList;

		const selectedGrade = event.cookies.get("selectedGrade");
		const grade = selectedGrade === "all" ? "all" : Number(selectedGrade);

		if (event.locals.user.school) {
			if (isAdmin) {
				subjectList = await db
					.select({
						...subjectColumns,
						subjectTypeName: subjectType.name,
						gradeLevel: grades.level,
					})
					.from(subject)
					.innerJoin(grades, eq(subject.gradesId, grades.id))
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
					.where(eq(subject.schoolId, event.locals.user.school));
			} else if (isTeacher) {
				const conditions = [
					eq(subject.schoolId, event.locals.user.school),
					exists(
						db.select().from(teacherAssign).where(eq(teacherAssign.userId, event.locals.user.id)),
					),
				];
				if (grade !== "all") {
					conditions.push(eq(grades.level, grade));
				}
				subjectList = await db
					.select({
						...subjectColumns,
						subjectTypeName: subjectType.name,
						gradeLevel: grades.level,
					})
					.from(subject)
					.innerJoin(grades, eq(subject.gradesId, grades.id))
					.where(and(...conditions))
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id));
			} else if (isStudent) {
				const conditions = [eq(subject.schoolId, event.locals.user.school)];
				if (grade !== "all") {
					conditions.push(eq(grades.level, grade));
				}
				subjectList = await db
					.select({
						...getTableColumns(schedule),
						...subjectColumns,
						subjectTypeName: subjectType.name,
						gradeLevel: grades.level,
					})
					.from(schedule)
					.innerJoin(subject, eq(schedule.subjectId, subject.id))
					.innerJoin(grades, eq(subject.gradesId, grades.id))
					.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
					.where(and(...conditions));
			}
		}
		return {
			subjectList,
			user: event.locals.user,
		};
	}
	return redirect(302, "/signin");
};
