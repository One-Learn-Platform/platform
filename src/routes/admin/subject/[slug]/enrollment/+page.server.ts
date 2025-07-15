import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { enrollment, grades, subject, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns, notExists } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const subjectCode = parseInt(slug, 10);
	const schoolId = event.locals.user?.school;

	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			if (isNaN(subjectCode)) {
				return error(400, { message: "Invalid Subject ID" });
			}
			if (!schoolId) {
				return error(400, { message: "School ID is required" });
			}
			const { ...rest } = getTableColumns(subject);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...restUser } = getTableColumns(user);
			const { ...all } = getTableColumns(enrollment);
			const teacherList = await db
				.select({ ...restUser })
				.from(user)
				.where(and(eq(user.roleId, 3), eq(user.schoolId, schoolId)));
			const studentList = await db
				.select({ ...restUser, grades: grades.level })
				.from(user)
				.where(
					and(
						eq(user.roleId, 4),
						eq(user.schoolId, schoolId),
						notExists(db.select().from(enrollment).where(eq(enrollment.userId, user.id))),
					),
				)
				.leftJoin(grades, eq(grades.id, user.gradesId));
			const enrolled = await db
				.select({ ...all, fullname: user.fullname })
				.from(enrollment)
				.where(and(eq(enrollment.subjectId, subjectCode), eq(enrollment.schoolId, schoolId)))
				.innerJoin(user, eq(user.id, enrollment.userId));
			const subjectData = await db
				.select({ ...rest, teacherName: user.fullname })
				.from(subject)
				.where(eq(subject.id, subjectCode))
				.leftJoin(user, eq(user.id, subject.teacher))
				.get();
			if (subjectData) {
				return {
					studentList: studentList,
					subjectData: subjectData,
					enrolled: enrolled,
					teacherList: teacherList,
				};
			} else {
				return error(404, { message: "Subject Not Found" });
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
		const subject = form.get("subjectId");
		if (!subject || typeof subject !== "string") {
			return fail(400, { enroll: { success: false, message: "Invalid Subject ID" } });
		}
		const subjectId = parseInt(subject, 10);
		if (isNaN(subjectId) || subjectId <= 0) {
			return fail(400, { enroll: { success: false, message: "Invalid Subject ID" } });
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
				.where(and(eq(enrollment.userId, userId), eq(enrollment.subjectId, subjectId)))
				.get();
			if (existingEnrollment) {
				return fail(400, {
					enroll: { success: false, message: "User already enrolled in this subject" },
				});
			}
			try {
				await db.insert(enrollment).values({
					userId: userId,
					subjectId: subjectId,
					schoolId: schoolId,
				});
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					enroll: { success: false, message: "Failed to enroll user in subject" },
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
						subjectId: subjectId,
						schoolId: schoolId,
					})),
				);
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					enroll: { success: false, message: "Failed to enroll users in subject" },
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
		const subject = form.get("subject");
		const id = form.get("id");
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return fail(400, {
				unenroll: { success: false, message: "You are not enrolled in any school" },
			});
		}
		if (!subject || typeof subject !== "string") {
			return fail(400, {
				unenroll: { success: false, message: "Invalid Subject ID. Please try again" },
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
		const subjectId = Number(subject);
		if (isNaN(subjectId) || subjectId <= 0) {
			return fail(400, {
				unenroll: { success: false, message: "Invalid Subject ID. Please try again" },
			});
		}
		try {
			await db
				.delete(enrollment)
				.where(
					and(
						eq(enrollment.userId, userId),
						eq(enrollment.subjectId, subjectId),
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
