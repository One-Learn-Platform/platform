import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import {
	assignment,
	forum,
	material,
	subject,
	subjectType,
	submission,
	user,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, exists, getTableColumns, sql } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const { subjectCode } = event.params;
	const chapter = Number(event.params.chapter);
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		const db = getDb(event);
		const subjectColumns = getTableColumns(subject);
		const subjectData = await db
			.select({ ...subjectColumns, subjectTypeName: subjectType.name })
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, event.locals.user.school)))
			.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
			.get();
		if (!subjectData) {
			return error(404, "Subject not found");
		}
		const assignmentColumns = getTableColumns(assignment);
		const quiz = await db.select().from(assignment).where(eq(assignment.quiz, true));
		const assignmentList = await db
			.select({
				...assignmentColumns,
				done: sql<number>`${exists(
					db
						.select()
						.from(submission)
						.where(
							and(
								eq(submission.assignmentId, assignment.id),
								eq(submission.userId, event.locals.user.id),
							),
						),
				)}`,
			})
			.from(assignment)
			.where(eq(assignment.subjectId, subjectData.id));
		const forumColumns = getTableColumns(forum);
		const forumList = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
				subjectCode: subject.code,
			})
			.from(forum)
			.where(
				and(
					eq(forum.schoolId, event.locals.user.school),
					eq(forum.subjectId, subjectData.id),
					eq(forum.chapter, chapter),
				),
			)
			.innerJoin(user, eq(forum.userId, user.id))
			.innerJoin(subject, eq(forum.subjectId, subject.id));
		const materialColumns = getTableColumns(material);
		const materialList = await db
			.select({ ...materialColumns })
			.from(material)
			.where(
				and(
					eq(material.schoolId, event.locals.user.school),
					eq(material.subjectId, subjectData.id),
					eq(material.chapter, chapter),
				),
			);
		return { quiz, forum: forumList, material: materialList, assignment: assignmentList };
	}
	return redirect(302, "/signin");
};
