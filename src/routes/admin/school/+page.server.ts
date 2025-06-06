import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaCreate } from "$lib/schema/school/schema";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { school } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";
import { eq, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const schoolList = await db.select().from(school);
	if (event.locals.user && event.locals.user.role === 1) {
		return {
			user: event.locals.user,
			role: event.locals.user?.role,
			schoolList: schoolList,
			form: await superValidate(zod4(formSchemaCreate)),
		};
	}
	return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	create: async (event) => {
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchemaCreate));
		console.log("form", form);

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}
		const uniqueFileName = `school/logo/${getFileName(form.data.name)}-${getTimeStamp()}.png`;
		const fileBuffer = await form.data.logo.arrayBuffer();
		try {
			await getR2(event).put(uniqueFileName, fileBuffer, {
				httpMetadata: {
					contentType: form.data.logo.type,
				},
			});
		} catch (error) {
			console.error("Failed to upload to R2:", error);
			return fail(500, {
				create: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error, please try again.",
				},

				form,
			});
		}
		const imageUrl = (await getR2(event).get(uniqueFileName))?.key ?? "";

		try {
			await db.insert(school).values({
				name: form.data.name,
				logo: imageUrl,
			});
			return withFiles({
				form,
				create: {
					success: true,
					data: { name: form.data.name },
					message: null,
				},
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
					message: error instanceof Error ? error.message : "Unknown error, please try again",
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
			const schooltbd = await db.select().from(school).where(eq(school.id, numberId)).get();
			await db.delete(school).where(eq(school.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: schooltbd?.name,
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

		const schoolArray = await db
			.select()
			.from(school)
			.where(or(...idArray.map((id) => eq(school.id, id))));
		const schoolNameArray = schoolArray.map((school) => school.name);

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			try {
				await db.delete(school).where(eq(school.id, id));
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
					name: schoolNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
