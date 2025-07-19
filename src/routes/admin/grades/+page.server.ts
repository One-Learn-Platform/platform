import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/grades/schema";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { grades } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, inArray, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const gradesList = await db.select().from(grades);
	if (event.locals.user) {
		if (event.locals.user.role === 1) {
			return {
				gradesList: gradesList,
				form: await superValidate(zod4(formSchema)),
			};
		}
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchema));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		try {
			await db.insert(grades).values({
				level: form.data.level,
			});
			return {
				create: { success: true, data: { level: form.data.level }, message: null },
				form,
			};
		} catch (error) {
			console.error(error);
			setError(form, "", "Database error, please try again", { status: 500 });
			return fail(500, {
				create: { success: false, data: null, message: "Database error, please try again" },
				form,
			});
		}
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
		const name = await db.select().from(grades).where(eq(grades.id, numberId)).get();
		if (!name) {
			return fail(404, {
				delete: { success: false, data: null, message: "Grade not found" },
			});
		}
		try {
			await db.delete(grades).where(eq(grades.id, numberId));
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
					id: numberId,
					name: name.level,
				},
				message: null,
			},
		};
	},
	multidelete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const ids = formData.get("ids");
		const idArray = ids
			?.toString()
			.split(",")
			.map((id) => Number(id));

		if (!idArray) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}

		const gradeArray = await db
			.select()
			.from(grades)
			.where(or(...idArray.map((id) => eq(grades.id, id))));
		const gradeNameArray = gradeArray.map((grade) => grade.level);

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
		});
		try {
			await db.delete(grades).where(inArray(grades.id, idArray));
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error, please try again.",
				},
			});
		}

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					name: gradeNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
