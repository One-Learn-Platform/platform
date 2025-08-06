import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, forum, grades, subject, user, classroom } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	event.depends("app:selectedGrade");
	if (event.locals.user) {
		const db = getDb(event);
		const schoolId = Number(event.locals.user.school);
		if (isNaN(schoolId) || schoolId <= 0) {
			return error(400, "Invalid school ID");
		}
		const isTeacher = event.locals.user.role === 3;
		const isStudent = event.locals.user.role === 4;
		let allForums;
		const selectedGrade = event.cookies.get("selectedGrade");
		const grade = selectedGrade === "all" ? "all" : Number(selectedGrade);

		if (isTeacher) {
			const conditions = [eq(forum.schoolId, schoolId), eq(forum.schoolId, schoolId)];
			if (grade !== "all") {
				conditions.push(eq(grades.level, grade));
			}
			allForums = await db
				.select({
					...getTableColumns(forum),
					fullname: user.fullname,
					avatar: user.avatar,
					subjectCode: subject.code,
				})
				.from(forum)
				.innerJoin(user, eq(forum.userId, user.id))
				.innerJoin(subject, eq(forum.subjectId, subject.id))
				.innerJoin(grades, eq(subject.gradesId, grades.id))
				.where(and(...conditions));
		} else if (isStudent) {
			const conditions = [
				eq(forum.schoolId, schoolId),
				eq(enrollment.userId, event.locals.user.id),
			];
			if (grade !== "all") {
				conditions.push(eq(grades.level, grade));
			}
			allForums = await db
				.select({
					...getTableColumns(forum),
					fullname: user.fullname,
					avatar: user.avatar,
					subjectCode: subject.code,
				})
				.from(forum)
				.innerJoin(user, eq(forum.userId, user.id))
				.innerJoin(subject, eq(forum.classroomId, subject.id))
				.innerJoin(grades, eq(subject.gradesId, grades.id))
				.where(and(...conditions));
		} else {
			allForums = await db
				.select({
					...getTableColumns(forum),
					fullname: user.fullname,
					avatar: user.avatar,
					subjectCode: subject.code,
				})
				.from(forum)
				.innerJoin(user, eq(forum.userId, user.id))
				.innerJoin(subject, eq(forum.classroomId, subject.id))
				.innerJoin(enrollment, eq(enrollment.classroomId, subject.id))
				.where(and(eq(forum.schoolId, schoolId), eq(enrollment.userId, event.locals.user.id)));
		}

		return {
			forums: allForums,
		};
	}
	return redirect(302, "/signin");
};
