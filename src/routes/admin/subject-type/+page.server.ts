import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/subject-type/schema";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { subjectType } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1) {
			const db = getDb(event);
			const subjectList = await db.select().from(subjectType);
			return {
				subjectList: subjectList,
				form: await superValidate(zod4(formSchema)),
			};
		}
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
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
			await db.insert(subjectType).values({
				name: form.data.name,
			});
			return {
				create: { success: true, data: { name: form.data.name }, message: null },
				form,
			};
		} catch (error) {
			console.error(error);
			setError(form, "", error instanceof Error ? error.message : "Unknown error", { status: 500 });
			return fail(500, {
				create: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error",
				},
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
		try {
			const name = await db.select().from(subjectType).where(eq(subjectType.id, numberId)).get();
			await db.delete(subjectType).where(eq(subjectType.id, numberId));
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

		if (!idArray) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}

		const subjectArray = await db
			.select()
			.from(subjectType)
			.where(or(...idArray.map((id) => eq(subjectType.id, id))));
		const subjectNameArray = subjectArray.map((subject) => subject.name);

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			try {
				await db.delete(subjectType).where(eq(subjectType.id, id));
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
		});

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					name: subjectNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
