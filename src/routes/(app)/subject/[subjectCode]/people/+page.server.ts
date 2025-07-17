import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { enrollment, subject, user } from "$lib/schema/db";
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userColumns } = getTableColumns(user);
		const students = await db
			.select({
				...userColumns,
				enrolledAt: enrollment.createdAt,
				...(event.locals.user.role === 3 && { score: enrollment.score }),
			})
			.from(enrollment)
			.innerJoin(user, eq(enrollment.userId, user.id))
			.where(eq(enrollment.subjectId, currentSubject.id))
			.orderBy(asc(user.fullname), asc(user.username));
		const teacher = await db
			.select({
				...userColumns,
			})
			.from(user)
			.where(eq(user.id, currentSubject.teacher))
			.get();
		return { students, teacher, subject: currentSubject };
	}
	return redirect(302, "/login");
};
