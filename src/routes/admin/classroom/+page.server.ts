import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/classroom/schema";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { classroom, grades } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, or, inArray, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			let classroomList;
			if (event.locals.user.school) {
				classroomList = await db
					.select({ ...getTableColumns(classroom), gradeLevel: grades.level })
					.from(classroom)
					.innerJoin(grades, eq(classroom.gradesId, grades.id))
					.where(eq(classroom.schoolId, event.locals.user.school));
			} else {
				classroomList = await db
					.select({ ...getTableColumns(classroom), gradeLevel: grades.level })
					.from(classroom)
					.innerJoin(grades, eq(classroom.gradesId, grades.id));
			}
			const gradesList = await db.select().from(grades);
			return {
				classroomList: classroomList,
				gradesList,
				form: await superValidate(zod4(formSchema)),
			};
		}
		return error(40, { message: "Not Found" });
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchema));
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			setError(form, "", "You must be associated with a school to create a class.");
			return fail(400, {
				create: {
					success: false,
					data: null,
					message: "You must be associated with a school to create a class.",
				},
				form,
			});
		}
		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		try {
			await db.insert(classroom).values({
				name: form.data.name,
				gradesId: form.data.gradesId,
				schoolId: schoolId,
			});
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error, please try again.",
				{ status: 500 },
			);
			return fail(500, {
				create: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error, please try again.",
				},
				form,
			});
		}
		return {
			create: { success: true, data: { name: form.data.name }, message: null },
			form,
		};
	},

	delete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const id = formData.get("id");
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
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
			const name = await db.select().from(classroom).where(eq(classroom.id, numberId)).get();
			await db.delete(classroom).where(eq(classroom.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: name?.name,
					},
					message: null,
				},
			};
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
	},
	multidelete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const ids = formData.get("ids");
		const idArray = ids
			?.toString()
			.split(",")
			.map((id) => Number(id));
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}

		if (!idArray) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}

		const classroomArray = await db
			.select()
			.from(classroom)
			.where(or(...idArray.map((id) => eq(classroom.id, id))));
		const classroomNameArray = classroomArray.map((classroom) => classroom.name);

		if (classroomNameArray.length === 0) {
			return fail(404, {
				delete: { success: false, data: null, message: "Classroom not found. Please try again." },
			});
		}

		for (const id of idArray) {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
		}

		try {
			await db.delete(classroom).where(inArray(classroom.id, idArray));
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

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					name: classroomNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
