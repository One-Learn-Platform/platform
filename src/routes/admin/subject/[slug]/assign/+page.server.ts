import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { grades, subject, teacherAssign, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq, getTableColumns, notExists } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const schoolId = event.locals.user.school;
			const db = getDb(event);
			const params = event.params;
			const { slug } = params;
			const subjectId = Number(slug);
			if (isNaN(subjectId) || subjectId <= 0) {
				return error(400, { message: "Invalid Subject ID" });
			}
			if (!schoolId) {
				return error(400, { message: "School ID is required" });
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...restUser } = getTableColumns(user);
			const teacherList = await db
				.select({ ...restUser, grades: grades.level })
				.from(user)
				.where(
					and(
						eq(user.roleId, 3),
						eq(user.schoolId, schoolId),
						notExists(
							db
								.select()
								.from(teacherAssign)
								.where(
									and(eq(teacherAssign.userId, user.id), eq(teacherAssign.subjectId, subjectId)),
								),
						),
					),
				)
				.leftJoin(grades, eq(grades.id, user.gradesId));
			const assigned = await db
				.select({ ...getTableColumns(teacherAssign), fullname: user.fullname })
				.from(teacherAssign)
				.innerJoin(user, eq(user.id, teacherAssign.userId))
				.where(and(eq(teacherAssign.subjectId, subjectId)));
			const subjectData = await db
				.select({ ...getTableColumns(subject), gradeLevel: grades.level })
				.from(subject)
				.innerJoin(grades, eq(subject.gradesId, grades.id))
				.where(and(eq(subject.id, subjectId), eq(subject.schoolId, schoolId)))
				.get();
			if (subjectData) {
				return {
					teacherList,
					subjectData,
					assigned,
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
		const subjectForm = form.get("subjectId");
		if (!subjectForm || typeof subjectForm !== "string") {
			return fail(400, { assign: { success: false, message: "Invalid Subject ID" } });
		}
		const subjectId = Number(subjectForm);
		if (isNaN(subjectId) || subjectId <= 0) {
			return fail(400, { assign: { success: false, message: "Invalid Subject ID" } });
		}

		if (type === "single") {
			const selected = form.get("selected");
			if (!selected || typeof selected !== "string") {
				return fail(400, { assign: { success: false, message: "No teacher selected" } });
			}
			const userId = Number(selected);
			if (isNaN(userId) || userId <= 0) {
				return fail(400, { assign: { success: false, message: "Invalid User ID" } });
			}
			const selectedUser = await db.select().from(user).where(eq(user.id, userId)).get();
			if (!selectedUser) {
				return fail(404, { assign: { success: false, message: "Teacher not found" } });
			}
			const existingAssigned = await db
				.select()
				.from(teacherAssign)
				.where(and(eq(teacherAssign.userId, userId), eq(teacherAssign.subjectId, subjectId)))
				.get();
			if (existingAssigned) {
				return fail(400, {
					assign: { success: false, message: "Teacher already assigned to this subject" },
				});
			}
			try {
				await db.insert(teacherAssign).values({
					userId: userId,
					subjectId: subjectId,
					schoolId: schoolId,
				});
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					assign: {
						success: false,
						message: error instanceof Error ? error.message : "Failed to assign teacher to subject",
					},
				});
			}
		} else if (type === "multiple") {
			const selectedUsers = form.getAll("selected-multiple") as string[];
			if (!selectedUsers || selectedUsers.length === 0) {
				return fail(400, { assign: { success: false, message: "No teachers selected" } });
			}
			const usersList = [];
			for (const user of selectedUsers) {
				const userId = Number(user);
				if (isNaN(userId) || userId <= 0) {
					return fail(400, { assign: { success: false, message: "Invalid User ID" } });
				}
				usersList.push(userId);
			}
			try {
				await db.insert(teacherAssign).values(
					usersList.map((userId) => ({
						userId: userId,
						subjectId: subjectId,
						schoolId: schoolId,
					})),
				);
			} catch (error) {
				console.error("Enrollment Error:", error);
				return fail(500, {
					assign: { success: false, message: "Failed to assign teachers to subject" },
				});
			}
		}
		return { assign: { success: true, message: "Teachers assigned successfully" } };
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
		const subjectForm = form.get("subjectId");
		const id = form.get("id");
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return fail(400, {
				unassign: { success: false, message: "You are not enrolled in any school" },
			});
		}
		if (!subjectForm || typeof subjectForm !== "string") {
			return fail(400, {
				unassign: { success: false, message: "Invalid subject ID. Please try again" },
			});
		}
		if (!id || typeof id !== "string") {
			return fail(400, {
				unassign: { success: false, message: "Invalid User ID. Please try again" },
			});
		}
		const userId = Number(id);
		if (isNaN(userId) || userId <= 0) {
			return fail(400, {
				unassign: { success: false, message: "User Not Found. Please try again" },
			});
		}
		const subjectId = Number(subjectForm);
		if (isNaN(subjectId) || subjectId <= 0) {
			return fail(400, {
				unassign: { success: false, message: "Invalid Subject ID. Please try again" },
			});
		}
		try {
			await db
				.delete(teacherAssign)
				.where(and(eq(teacherAssign.userId, userId), eq(teacherAssign.subjectId, subjectId)));
		} catch (error) {
			console.error("Unassign Error:", error);
			return fail(500, {
				unassign: {
					success: false,
					message: error instanceof Error ? error.message : "Failed to unassign user from subject",
				},
			});
		}
		return {
			unassign: { success: true, message: "User unassigned successfully" },
		};
	},
};
