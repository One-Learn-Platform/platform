import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import {
  assignment,
  enrollment,
  grades,
  subject,
  subjectType,
  submission,
  teacherAssign
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, desc, eq, exists, getTableColumns, sql } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	event.depends("app:selectedGrade");
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const schoolId = event.locals.user.school;
		if (isNaN(schoolId) || schoolId < 0) {
			return error(400, "Invalid school");
		}
		const isTeacher = event.locals.user.role === 3;
		const isStudent = event.locals.user.role === 4;

		let allAssignments;
		const selectedGrade = event.cookies.get("selectedGrade");
		const grade = selectedGrade === "all" ? "all" : Number(selectedGrade);
		if (isTeacher) {
			const condition = [
				eq(assignment.schoolId, schoolId),
				exists(
					db.select().from(teacherAssign).where(eq(teacherAssign.userId, event.locals.user.id)),
				),
			];
			if (grade !== "all") {
				condition.push(eq(grades.level, grade));
			}
			allAssignments = await db
				.select({
					...getTableColumns(assignment),
					subject: subject.name,
					subjectCode: subject.code,
					subjectType: subjectType.name,
					gradeLevel: grades.level,
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
					missed: sql<number>`CASE 
                  WHEN ${assignment.dueDate} < datetime('now') 
                  AND NOT ${exists(
										db
											.select()
											.from(submission)
											.where(
												and(
													eq(submission.assignmentId, assignment.id),
													eq(submission.userId, event.locals.user.id),
												),
											),
									)}
                  THEN 1 
                  ELSE 0 
              END`,
				})
				.from(assignment)
				.innerJoin(subject, eq(assignment.subjectId, subject.id))
				.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
				.innerJoin(grades, eq(subject.gradesId, grades.id))
				.where(and(...condition))
				.orderBy(desc(assignment.createdAt));
		} else if (isStudent) {
			const condition = [
				eq(assignment.schoolId, schoolId),
				eq(enrollment.userId, event.locals.user.id),
				exists(
					db.select().from(enrollment).where(eq(enrollment.classroomId, assignment.classroomId)),
				),
			];
			if (grade !== "all") {
				condition.push(eq(grades.level, grade));
			}
			allAssignments = await db
				.select({
					...getTableColumns(assignment),
					subject: subject.name,
					subjectCode: subject.code,
					subjectType: subjectType.name,
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
					missed: sql<number>`CASE 
                  WHEN ${assignment.dueDate} < datetime('now') 
                  AND NOT ${exists(
										db
											.select()
											.from(submission)
											.where(
												and(
													eq(submission.assignmentId, assignment.id),
													eq(submission.userId, event.locals.user.id),
												),
											),
									)}
                  THEN 1 
                  ELSE 0 
              END`,
				})
				.from(assignment)
				.innerJoin(subject, eq(assignment.subjectId, subject.id))
				.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
				.innerJoin(grades, eq(subject.gradesId, grades.id))
				.where(and(...condition))
				.orderBy(desc(assignment.createdAt));
		} else {
			allAssignments = await db
				.select({
					...getTableColumns(assignment),
					subject: subject.name,
					subjectCode: subject.code,
					subjectType: subjectType.name,
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
					missed: sql<number>`CASE 
                  WHEN ${assignment.dueDate} < datetime('now') 
                  AND NOT ${exists(
										db
											.select()
											.from(submission)
											.where(
												and(
													eq(submission.assignmentId, assignment.id),
													eq(submission.userId, event.locals.user.id),
												),
											),
									)}
                  THEN 1 
                  ELSE 0 
              END`,
				})
				.from(assignment)
				.innerJoin(subject, eq(assignment.subjectId, subject.id))
				.innerJoin(subjectType, eq(subject.subjectType, subjectType.id))
				.where(and(eq(assignment.schoolId, schoolId), eq(enrollment.userId, event.locals.user.id)))
				.orderBy(desc(assignment.createdAt));
		}

		return { assignments: allAssignments };
	}
	return redirect(302, "/signin");
};
