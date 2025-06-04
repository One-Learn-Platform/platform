import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

import { superValidate, setError, fail, withFiles } from "sveltekit-superforms";
import { formSchemaCreate } from "$lib/schema/school/schema";
import { zod4 } from "sveltekit-superforms/adapters";

import * as table from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { eq } from "drizzle-orm";
import { getFileName, getTimeStamp } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const schoolList = await db.select().from(table.school);
	if (event.locals.user) {
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
		} catch (r2Error) {
			console.error("Failed to upload to R2:", r2Error);
			return fail(500, {
				create: { success: false, data: null, message: "Failed to upload file" },

				form,
			});
		}
		const imageUrl = (await getR2(event).get(uniqueFileName))?.key ?? "";

		try {
			await db.insert(table.school).values({
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
		try {
			const name = await db.select().from(table.userRole).where(eq(table.userRole.id, numberId));
			await db.delete(table.userRole).where(eq(table.userRole.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: name[0].name,
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
};
