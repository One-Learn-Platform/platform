import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaEdit } from "$lib/schema/school/schema";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { school } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const schoolId = parseInt(slug, 10);

	if (event.locals.user && event.locals.user.role === 1) {
		if (isNaN(schoolId)) {
			return error(400, { message: "Invalid School ID" });
		} else {
			const schoolData = await db.select().from(school).where(eq(school.id, schoolId)).get();
			if (schoolData) {
				return {
					schoolData: schoolData,
					form: await superValidate(zod4(formSchemaEdit)),
				};
			} else {
				return error(404, { message: "School Not Found" });
			}
		}
	}
	return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const schoolId = parseInt(slug, 10);
		const form = await superValidate(event, zod4(formSchemaEdit));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		const prevSchoolData = await db.select().from(school).where(eq(school.id, schoolId)).get();
		if (!prevSchoolData)
			return fail(404, { edit: { success: false, data: null, message: "School not found" } });

		const uniqueFileName = `school/logo/${getFileName(form.data.name)}-${getTimeStamp()}.png`;
		const prevFileName = prevSchoolData.logo;

		const schoolExists = await db
			.select()
			.from(school)
			.where(eq(school.name, form.data.name))
			.get();
		if (schoolExists && schoolExists.id !== schoolId) {
			return fail(400, {
				edit: {
					success: false,
					data: null,
					message: "School with this name already exists.",
				},
				form,
			});
		}
		if (await getR2(event).head(uniqueFileName)) {
			return fail(400, {
				edit: { success: false, data: null, message: "File with this name already exists" },
				form,
			});
		}

		const oldFile = await getR2(event).get(prevFileName);
		let fileBuffer: ArrayBuffer;
		if (form.data.logo) {
			fileBuffer = await form.data.logo.arrayBuffer();
		} else if (oldFile?.arrayBuffer) {
			fileBuffer = await oldFile.arrayBuffer();
		} else {
			return fail(500, {
				edit: { success: false, data: null, message: "Failed to read file from storage" },
				form,
			});
		}

		try {
			await getR2(event).put(uniqueFileName, fileBuffer, {
				httpMetadata: {
					contentType: form.data.logo?.type ?? oldFile?.httpMetadata?.contentType ?? "image/png",
				},
			});
			await getR2(event).delete(prevFileName);
		} catch (error) {
			console.error("Failed to upload to R2:", error);
			return fail(500, {
				edit: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Failed to upload file",
				},
				form,
			});
		}
		const imageUrl = (await getR2(event).get(uniqueFileName))?.key ?? "";

		try {
			await db
				.update(school)
				.set({
					name: form.data.name,
					logo: imageUrl,
				})
				.where(eq(school.id, schoolId));
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
			const schooltbd = await db.select().from(school).where(eq(school.id, numberId)).get();
			if (!schooltbd) {
				return fail(404, {
					delete: {
						success: false,
						data: null,
						message: "School not found. Please try again.",
					},
				});
			}
			await db.delete(school).where(eq(school.id, numberId));
			redirect(302, "/admin/school");
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
