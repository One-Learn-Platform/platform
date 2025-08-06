import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

import { enrollment, subject, subjectType, teacherAssign } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: LayoutServerLoad = async (event) => {
	const { subjectCode, chapter } = event.params;
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const userId = event.locals.user.id;
		const columns = getTableColumns(subject);
		const subjectData = await db
			.select({ ...columns, subjectTypeName: subjectType.name })
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, event.locals.user.school)))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.get();
		if (!subjectData) {
			return error(404, "Subject not found");
		}
		if (event.locals.user.role === 3) {
			const isTeacher = await db
				.select()
				.from(teacherAssign)
				.where(and(eq(teacherAssign.userId, userId), eq(teacherAssign.subjectId, subjectData.id)))
				.get();
			if (!isTeacher) {
				return error(403, "Forbidden: You are not the teacher of this subject");
			}
		} else if (event.locals.user.role === 4) {
			const enrollmentData = await db
				.select()
				.from(enrollment)
				.where(eq(enrollment.userId, userId))
				.get();
			if (!enrollmentData) {
				return error(404, "Not Found");
			}
		}
		return { params: subjectCode, chapter: chapter, subject: subjectData };
	}
	return redirect(302, "/signin");
};
