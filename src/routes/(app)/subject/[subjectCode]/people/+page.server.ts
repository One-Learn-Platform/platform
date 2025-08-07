import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { schedule, subject, teacherAssign, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, asc, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const { subjectCode } = event.params;
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return error(400, "You are not associated with any school");
		}
		if (!subjectCode) {
			return error(400, "Invalid subject code");
		}
		const db = getDb(event);
		const currentSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!currentSubject) {
			return error(404, "Subject not found");
		}
		const currentClassroom = await db
			.select()
			.from(schedule)
			.where(and(eq(schedule.subjectId, currentSubject.id)))
			.get();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, score, ...userColumns } = getTableColumns(user);
		const students = await db
			.select({
				...userColumns,
				...(event.locals.user.role === 3 && { score: user.score }),
			})
			.from(user)
			.where(eq(user.classroomId, currentSubject.id))
			.orderBy(asc(user.fullname), asc(user.username));
		const teacher = await db
			.select({
				...getTableColumns(teacherAssign),
				...userColumns,
			})
			.from(teacherAssign)
			.innerJoin(user, eq(teacherAssign.userId, user.id))
			.where(eq(teacherAssign.subjectId, currentSubject.id))
			.get();
		return { students, teacher, subject: currentSubject };
	}
	return redirect(302, "/login");
};
