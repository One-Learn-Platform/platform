import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, forum, grades, subject, user } from "$lib/schema/db";
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
		const forumColumns = getTableColumns(forum);
		const isTeacher = event.locals.user.role === 3;
		const isStudent = event.locals.user.role === 4;
		let allForums;
		if (isTeacher) {
			allForums = await db
				.select({
					...forumColumns,
					fullname: user.fullname,
					avatar: user.avatar,
					subjectCode: subject.code,
					teacher: subject.teacher,
				})
				.from(forum)
				.innerJoin(user, eq(forum.userId, user.id))
				.innerJoin(subject, eq(forum.subjectId, subject.id))
				.where(and(eq(forum.schoolId, schoolId), eq(subject.teacher, event.locals.user.id)));
		} else if (isStudent) {
			const conditions = [
				eq(forum.schoolId, schoolId),
				eq(enrollment.userId, event.locals.user.id),
			];
			const selectedGrade = event.cookies.get("selectedGrade");
			const grade = selectedGrade === "all" ? "all" : Number(selectedGrade);
			if (grade !== "all") {
				conditions.push(eq(grades.level, grade));
			}
			allForums = await db
				.select({
					...forumColumns,
					fullname: user.fullname,
					avatar: user.avatar,
					subjectCode: subject.code,
					teacher: subject.teacher,
				})
				.from(forum)
				.innerJoin(user, eq(forum.userId, user.id))
				.innerJoin(subject, eq(forum.subjectId, subject.id))
				.innerJoin(enrollment, eq(enrollment.subjectId, subject.id))
				.innerJoin(grades, eq(subject.gradesId, grades.id))
				.where(and(...conditions));
		} else {
			allForums = await db
				.select({
					...forumColumns,
					fullname: user.fullname,
					avatar: user.avatar,
					subjectCode: subject.code,
					teacher: subject.teacher,
				})
				.from(forum)
				.innerJoin(user, eq(forum.userId, user.id))
				.innerJoin(subject, eq(forum.subjectId, subject.id))
				.innerJoin(enrollment, eq(enrollment.subjectId, subject.id))
				.where(and(eq(forum.schoolId, schoolId), eq(enrollment.userId, event.locals.user.id)));
		}

		return {
			forums: allForums,
		};
	}
	return redirect(302, "/signin");
};
