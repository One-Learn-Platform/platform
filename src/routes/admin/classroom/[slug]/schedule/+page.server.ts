import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { classroom, grades, schedule, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns, notExists } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const classroomId = Number(slug);
		if (isNaN(classroomId) || classroomId <= 0) {
			return error(400, { message: "Invalid Classroom ID" });
		}
		const schoolId = event.locals.user.school;
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			if (isNaN(classroomId)) {
				return error(400, { message: "Invalid Subject ID" });
			}
			if (!schoolId) {
				return error(400, { message: "School ID is required" });
			}
			const currentClassroom = await db
				.select()
				.from(classroom)
				.where(and(eq(classroom.id, classroomId), eq(classroom.schoolId, schoolId)))
				.get();
			if (!currentClassroom) {
				return error(404, { message: "Classroom Not Found" });
			}
			const subjectList = await db
				.select({ ...getTableColumns(subject), gradeLevel: grades.level })
				.from(subject)
				.where(
					and(
						eq(subject.schoolId, schoolId),
						eq(subject.gradesId, currentClassroom.gradesId),
						notExists(
							db
								.select()
								.from(schedule)
								.where(
									and(eq(schedule.subjectId, subject.id), eq(schedule.classroomId, classroomId)),
								),
						),
					),
				)
				.innerJoin(grades, eq(grades.id, subject.gradesId));
			const scheduled = await db
				.select({ ...getTableColumns(schedule), subjectName: subject.name })
				.from(schedule)
				.innerJoin(subject, eq(subject.id, schedule.subjectId))
				.where(and(eq(schedule.classroomId, classroomId), eq(schedule.schoolId, schoolId)));
			const classData = await db
				.select({ ...getTableColumns(classroom), gradeLevel: grades.level })
				.from(classroom)
				.innerJoin(grades, eq(classroom.gradesId, grades.id))
				.where(and(eq(classroom.id, classroomId), eq(classroom.schoolId, schoolId)))
				.get();
			if (classData) {
				return {
					subjectList,
					classData,
					scheduled,
				};
			} else {
				return error(404, { message: "Class Not Found" });
			}
		}
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	assign: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		if (event.locals.user?.role !== 1 && event.locals.user?.role !== 2) {
			return fail(403, {
				assign: {
					success: false,
					data: null,
					message: "Enrollment action is not allowed in this context",
				},
			});
		}
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return fail(400, {
				assign: { success: false, message: "You are not enrolled in any school" },
			});
		}
		const db = getDb(event);
		const form = await event.request.formData();
		const type = form.get("type");
		const classroomForm = form.get("classId");
		if (!classroomForm || typeof classroomForm !== "string") {
			return fail(400, { assign: { success: false, message: "Invalid Class ID" } });
		}
		const classroomId = Number(classroomForm);
		if (isNaN(classroomId) || classroomId <= 0) {
			return fail(400, { assign: { success: false, message: "Invalid Class ID" } });
		}

		if (type === "single") {
			const selected = form.get("selected");
			if (!selected || typeof selected !== "string") {
				return fail(400, { assign: { success: false, message: "No subject selected" } });
			}
			const subjectId = Number(selected);
			if (isNaN(subjectId) || subjectId <= 0) {
				return fail(400, { assign: { success: false, message: "Invalid Subject ID" } });
			}
			const selectedSubject = await db
				.select()
				.from(subject)
				.where(eq(subject.id, subjectId))
				.get();
			if (!selectedSubject) {
				return fail(404, { assign: { success: false, message: "Subject not found" } });
			}
			const existingSchedule = await db
				.select()
				.from(schedule)
				.where(and(eq(schedule.subjectId, subjectId), eq(schedule.classroomId, classroomId)))
				.get();
			if (existingSchedule) {
				return fail(400, {
					assign: { success: false, message: "User already enrolled in this class" },
				});
			}
			try {
				await db.insert(schedule).values({
					subjectId: subjectId,
					classroomId: classroomId,
					schoolId: schoolId,
				});
			} catch (error) {
				console.error("Assigning Error:", error);
				return fail(500, {
					assign: {
						success: false,
						message: error instanceof Error ? error.message : "Failed to assign subject",
					},
				});
			}
		} else if (type === "multiple") {
			const selectedSubjects = form.getAll("selected-multiple") as string[];
			if (!selectedSubjects || selectedSubjects.length === 0) {
				return fail(400, { assign: { success: false, message: "No students selected" } });
			}
			const subjectList = [];
			for (const subject of selectedSubjects) {
				const subjectId = Number(subject);
				if (isNaN(subjectId) || subjectId <= 0) {
					return fail(400, { assign: { success: false, message: "Invalid User ID" } });
				}
				subjectList.push(subjectId);
			}
			try {
				await db.insert(schedule).values(
					subjectList.map((subjectId) => ({
						subjectId: subjectId,
						classroomId: classroomId,
						schoolId: schoolId,
					})),
				);
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					assign: { success: false, message: "Failed to enroll users in class" },
				});
			}
		}
		return { assign: { success: true, message: "Users enrolled successfully" } };
	},
	unassign: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		if (event.locals.user?.role !== 1 && event.locals.user?.role !== 2) {
			return error(404, "Not Found");
		}
		const db = getDb(event);
		const form = await event.request.formData();
		const classroomForm = form.get("classId");
		const id = form.get("id");
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return fail(400, {
				unassign: { success: false, message: "You are not enrolled in any school" },
			});
		}
		if (!classroomForm || typeof classroomForm !== "string") {
			return fail(400, {
				unassign: { success: false, message: "Invalid Class ID. Please try again" },
			});
		}
		if (!id || typeof id !== "string") {
			return fail(400, {
				unassign: { success: false, message: "Invalid User ID. Please try again" },
			});
		}
		const classroomId = Number(classroomForm);
		if (isNaN(classroomId) || classroomId <= 0) {
			return fail(400, {
				unassign: { success: false, message: "Invalid Class ID. Please try again" },
			});
		}
		const subjectId = Number(id);
		if (isNaN(subjectId) || subjectId <= 0) {
			return fail(400, {
				unassign: { success: false, message: "User Not Found. Please try again" },
			});
		}
		try {
			await db
				.delete(schedule)
				.where(
					and(
						eq(schedule.subjectId, subjectId),
						eq(schedule.classroomId, classroomId),
						eq(schedule.schoolId, schoolId),
					),
				);
		} catch (error) {
			console.error("Unassigning Failed", error);
			return fail(500, {
				unassign: {
					success: false,
					message: error instanceof Error ? error.message : "Failed to unassign subject",
				},
			});
		}
		return {
			unassign: { success: true, message: "Subject unassigned successfully" },
		};
	},
};
