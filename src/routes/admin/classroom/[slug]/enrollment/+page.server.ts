import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { enrollment, grades, user, classroom } from "$lib/schema/db";
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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...restUser } = getTableColumns(user);
			const studentList = await db
				.select({ ...restUser, grades: grades.level })
				.from(user)
				.where(
					and(
						eq(user.roleId, 4),
						eq(user.schoolId, schoolId),
						notExists(
							db
								.select()
								.from(enrollment)
								.where(
									and(eq(enrollment.userId, user.id), eq(enrollment.classroomId, classroomId)),
								),
						),
					),
				)
				.leftJoin(grades, eq(grades.id, user.gradesId));
			const enrolled = await db
				.select({ ...getTableColumns(enrollment), fullname: user.fullname })
				.from(enrollment)
				.where(and(eq(enrollment.classroomId, classroomId), eq(enrollment.schoolId, schoolId)))
				.innerJoin(user, eq(user.id, enrollment.userId));
			const classData = await db
				.select({ ...getTableColumns(classroom), gradesLevel: grades.level })
				.from(classroom)
				.innerJoin(grades, eq(classroom.gradesId, grades.id))
				.where(and(eq(classroom.id, classroomId), eq(classroom.schoolId, schoolId)))
				.get();
			if (classData) {
				return {
					studentList: studentList,
					classData: classData,
					enrolled: enrolled,
				};
			} else {
				return error(404, { message: "Class Not Found" });
			}
		}
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	enroll: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		if (event.locals.user?.role !== 1 && event.locals.user?.role !== 2) {
			return fail(403, {
				enroll: {
					success: false,
					data: null,
					message: "Enrollment action is not allowed in this context",
				},
			});
		}
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return fail(400, {
				enroll: { success: false, message: "You are not enrolled in any school" },
			});
		}
		const db = getDb(event);
		const form = await event.request.formData();
		const type = form.get("type");
		const classroomForm = form.get("classId");
		if (!classroomForm || typeof classroomForm !== "string") {
			return fail(400, { enroll: { success: false, message: "Invalid Class ID" } });
		}
		const classroomId = parseInt(classroomForm, 10);
		if (isNaN(classroomId) || classroomId <= 0) {
			return fail(400, { enroll: { success: false, message: "Invalid Class ID" } });
		}

		if (type === "single") {
			const selected = form.get("selected");
			if (!selected || typeof selected !== "string") {
				return fail(400, { enroll: { success: false, message: "No student selected" } });
			}
			const userId = parseInt(selected, 10);
			if (isNaN(userId) || userId <= 0) {
				return fail(400, { enroll: { success: false, message: "Invalid User ID" } });
			}
			const selectedUser = await db.select().from(user).where(eq(user.id, userId)).get();
			if (!selectedUser) {
				return fail(404, { enroll: { success: false, message: "User not found" } });
			}
			const existingEnrollment = await db
				.select()
				.from(enrollment)
				.where(and(eq(enrollment.userId, userId), eq(enrollment.classroomId, classroomId)))
				.get();
			if (existingEnrollment) {
				return fail(400, {
					enroll: { success: false, message: "User already enrolled in this class" },
				});
			}
			try {
				await db.insert(enrollment).values({
					userId: userId,
					classroomId: classroomId,
					schoolId: schoolId,
				});
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					enroll: { success: false, message: "Failed to enroll user in class" },
				});
			}
		} else if (type === "multiple") {
			const selectedUsers = form.getAll("selected-multiple") as string[];
			if (!selectedUsers || selectedUsers.length === 0) {
				return fail(400, { enroll: { success: false, message: "No students selected" } });
			}
			const usersList = [];
			for (const user of selectedUsers) {
				const userId = Number(user);
				if (isNaN(userId) || userId <= 0) {
					return fail(400, { enroll: { success: false, message: "Invalid User ID" } });
				}
				usersList.push(userId);
			}
			try {
				await db.insert(enrollment).values(
					usersList.map((userId) => ({
						userId: userId,
						classroomId: classroomId,
						schoolId: schoolId,
					})),
				);
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					enroll: { success: false, message: "Failed to enroll users in class" },
				});
			}
		}
		return { enroll: { success: true, message: "Users enrolled successfully" } };
	},
	unenroll: async (event) => {
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
				unenroll: { success: false, message: "You are not enrolled in any school" },
			});
		}
		if (!classroomForm || typeof classroomForm !== "string") {
			return fail(400, {
				unenroll: { success: false, message: "Invalid Class ID. Please try again" },
			});
		}
		if (!id || typeof id !== "string") {
			return fail(400, {
				unenroll: { success: false, message: "Invalid User ID. Please try again" },
			});
		}
		const userId = Number(id);
		if (isNaN(userId) || userId <= 0) {
			return fail(400, {
				unenroll: { success: false, message: "User Not Found. Please try again" },
			});
		}
		const classroomId = Number(classroomForm);
		if (isNaN(classroomId) || classroomId <= 0) {
			return fail(400, {
				unenroll: { success: false, message: "Invalid Class ID. Please try again" },
			});
		}
		try {
			await db
				.delete(enrollment)
				.where(
					and(
						eq(enrollment.userId, userId),
						eq(enrollment.classroomId, classroomId),
						eq(enrollment.schoolId, schoolId),
					),
				);
		} catch (error) {
			console.error("Unenrollment Error:", error);
			return fail(500, {
				unenroll: { success: false, message: "Failed to unenroll user from subject" },
			});
		}
		return {
			unenroll: { success: true, message: "User unenrolled successfully" },
		};
	},
};
