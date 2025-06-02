import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaEdit } from "$lib/schema/subject/schema";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { getDb } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const schoolId = parseInt(slug, 10);

	if (!event.locals.user || (event.locals.user.role !== 0 && event.locals.user.role !== 1)) {
		return error(404, { message: "Not Found" });
	} else if (isNaN(schoolId)) {
		return error(400, { message: "Invalid School ID" });
	} else {
		const { ...rest } = getTableColumns(table.subject);
		const teacherList = await db.select().from(table.user).where(eq(table.user.roleId, 1));
		const subject = await db
			.select({
				...rest,
				teacherName: table.user.fullname,
			})
			.from(table.subject)
			.where(eq(table.subject.id, schoolId))
			.leftJoin(table.user, eq(table.user.id, table.subject.teacher))
			.get();
		if (subject) {
			return {
				subjectData: subject,
				teacherList: teacherList,
				form: await superValidate(zod(formSchemaEdit)),
			};
		} else {
			return error(404, { message: "Subject Not Found" });
		}
	}
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const form = await superValidate(event, zod(formSchemaEdit));
		const subjectId = Number(slug);
		const teacherId = Number(form.data.teacher);

		if (isNaN(subjectId) || subjectId <= 0) {
			setError(form, "", "Invalid subject ID, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Invalid subject ID, please try again" },
				form,
			});
		}

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		if (isNaN(teacherId) || teacherId <= 0) {
			setError(form, "teacher", "Invalid teacher ID, please select a valid teacher");
			return fail(400, {
				edit: {
					success: false,
					data: null,
					message: "Invalid teacher ID, please select a valid teacher",
				},
				form,
			});
		}
		const teacher = await db.select().from(table.user).where(eq(table.user.id, teacherId)).get();
		if (!teacher) {
			setError(form, "teacher", "Teacher not found, please select a valid teacher");
			return fail(404, {
				edit: {
					success: false,
					data: null,
					message: "Teacher not found, please select a valid teacher",
				},
				form,
			});
		}

		try {
			await db
				.update(table.subject)
				.set({
					name: form.data.name,
					teacher: teacherId,
				})
				.where(eq(table.subject.id, subjectId));
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

		if (event.url.searchParams.has("ref")) redirect(303, "/admin/user");
		else {
			return withFiles({
				edit: {
					success: true,
					data: {
						name: form.data.name,
					},
					message: "User created successfully",
				},
				form,
			});
		}
	},
	delete: async (event) => {
		const db = getDb(event);
		const form = await event.request.formData();
		const id = form.get("id");

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
			const selectName = await db
				.select()
				.from(table.subject)
				.where(eq(table.subject.id, numberId));
			const name = selectName.at(0);
			if (!name) {
				return fail(404, {
					delete: {
						success: false,
						data: null,
						message: "Subject not found. Please try again.",
					},
				});
			}
			await db.delete(table.subject).where(eq(table.subject.id, numberId));
			redirect(303, "/admin/subject");
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
};
