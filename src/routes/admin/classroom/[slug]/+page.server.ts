import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaEdit } from "$lib/schema/classroom/schema";
import { setError, superValidate, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { grades, classroom } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, and, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			const params = event.params;
			const { slug } = params;
			const classroomId = Number(slug);
			if (isNaN(classroomId) || classroomId <= 0) {
				return error(400, { message: "Invalid Classroom ID" });
			}
			const schoolId = event.locals.user.school;
			const gradesList = await db.select().from(grades);
			let selectedClassroom;
			if (schoolId) {
				selectedClassroom = await db
					.select({ ...getTableColumns(classroom), gradesLevel: grades.level })
					.from(classroom)
					.innerJoin(grades, eq(classroom.gradesId, grades.id))
					.where(and(eq(classroom.id, classroomId), eq(classroom.schoolId, schoolId)))
					.get();
			} else {
				selectedClassroom = await db
					.select({ ...getTableColumns(classroom), gradesLevel: grades.level })
					.from(classroom)
					.innerJoin(grades, eq(classroom.gradesId, grades.id))
					.where(eq(classroom.id, classroomId))
					.get();
			}
			if (!selectedClassroom) {
				return error(404, { message: "Classroom not found" });
			}
			return {
				classroom: selectedClassroom,
				gradesList,
				form: await superValidate(zod4(formSchemaEdit)),
			};
		}
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const roleId = parseInt(slug, 10);
		const form = await superValidate(event, zod4(formSchemaEdit), {
			id: "edit",
		});
		const formData = form.data;

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		const prevClassroomData = (
			await db.select().from(classroom).where(eq(classroom.id, roleId))
		).at(0);
		if (!prevClassroomData)
			return fail(404, {
				edit: { success: false, data: null, message: "Classroom not found" },
				form,
			});

		try {
			await db
				.update(classroom)
				.set({
					name: formData.name,
				})
				.where(eq(classroom.id, roleId));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				edit: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}
		if (event.url.searchParams.has("ref")) return redirect(303, "/admin/classroom");
		return {
			edit: {
				success: true,
				data: {
					name: formData.name,
				},
				message: "Classroom edited successfully",
			},
			form,
		};
	},
	delete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const id = formData.get("id");

		if (!id) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}
		const numberId = Number(id);
		if (isNaN(numberId)) {
			return fail(400, {
				delete: { success: false, data: null, message: "ID is not a number. Please try again." },
			});
		}
		try {
			const toDelete = await db.select().from(classroom).where(eq(classroom.id, numberId)).get();
			if (!toDelete) {
				return fail(404, {
					delete: {
						success: false,
						data: null,
						message: "Classroom not found. Please try again.",
					},
				});
			}
			await db.delete(classroom).where(eq(classroom.id, numberId));
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}
		return redirect(302, "/admin/classroom");
	},
};
