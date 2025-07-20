import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { material, subject } from "$lib/schema/db";
import { formSchemaEdit } from "$lib/schema/material/schema";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileExtension, getFileName, getTimeStamp } from "$lib/utils";

import { and, eq } from "drizzle-orm";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const chapter = Number(event.params.chapter);
		const id = Number(event.params.id);

		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		const selectedMaterial = await db
			.select()
			.from(material)
			.where(and(eq(material.id, id), eq(material.chapter, chapter)))
			.get();
		if (!selectedMaterial) {
			return error(404, "Material not found");
		}
		return {
			material: selectedMaterial,
			form: await superValidate(event, zod4(formSchemaEdit)),
		};
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	edit: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const r2 = getR2(event);
		const userId = event.locals.user.id;
		const schoolId = event.locals.user.school;
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		const materialId = Number(event.params.id);
		const form = await superValidate(event, zod4(formSchemaEdit));
		console.log(form);
		if (!form.valid) {
			setError(form, "", "Form is invalid");
			return fail(400, {
				create: {
					success: false,
					message: "Form is invalid",
				},
				form,
			});
		}
		if (!userId) {
			setError(form, "", "User not found");
			return fail(403, {
				create: {
					success: false,
					message: "User not found",
				},
				form,
			});
		}
		if (!schoolId) {
			setError(form, "", "School not found");
			return fail(404, {
				create: {
					success: false,
					message: "School not found",
				},
				form,
			});
		}
		let attachmentName;
		try {
			const subjectId = await db
				.select({ id: subject.id })
				.from(subject)
				.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
				.get();
			if (!subjectId) {
				setError(form, "", "Subject not found. Please try again.");
				return fail(404, {
					create: {
						success: false,
						message: "Subject not found. Please try again.",
					},
					form,
				});
			}
			const beforeMaterial = await db
				.select()
				.from(material)
				.where(eq(material.id, materialId))
				.get();
			if (!beforeMaterial) {
				setError(form, "", "Material not found. Please try again.");
				return fail(404, {
					create: {
						success: false,
						message: "Material not found. Please try again.",
					},
					form,
				});
			}
			try {
				const uniqueFileName = `subject/${subjectId.id}/${chapter}/${getFileName(form.data.attachment.name)}-${getTimeStamp()}.${getFileExtension(form.data.attachment.name)}`;
				attachmentName = uniqueFileName;
				const fileBuffer = await form.data.attachment.arrayBuffer();
				await r2.put(uniqueFileName, fileBuffer);
				if (beforeMaterial.attachment) {
					await r2.delete(beforeMaterial.attachment);
				}
			} catch (error) {
				console.error("Error uploading file:", error, form.data.attachment.name);
				return fail(500, { edit: { success: false, name: form.data.attachment.name }, form });
			}

			await db
				.update(material)
				.set({
					title: form.data.title,
					description: form.data.description,
					content: form.data.content,
					attachment: attachmentName,
				})
				.where(eq(material.id, materialId));
		} catch (error) {
			if (attachmentName) {
				await r2.delete(attachmentName);
			}
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error occurred. Please try again.",
			);
			return fail(500, {
				create: {
					success: false,
					message:
						error instanceof Error ? error.message : "Unknown error occurred. Please try again.",
				},
				form,
			});
		}

		return withFiles({
			create: {
				success: true,
				message: "Material updated successfully.",
			},
			form,
		});
	},
	delete: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const r2 = getR2(event);
		const formData = await event.request.formData();
		const id = Number(formData.get("material_id"));
		const { subjectCode } = event.params;
		const schoolId = event.locals.user.school;
		const chapter = Number(event.params.chapter);
		if (!id) {
			return fail(400, {
				delete: {
					success: false,
					message: "Material ID is required.",
				},
			});
		}
		if (isNaN(id)) {
			return fail(400, {
				delete: {
					success: false,
					message: "Invalid Material ID.",
				},
			});
		}
		if (!schoolId) {
			return fail(400, {
				delete: {
					success: false,
					message: "School ID is required.",
				},
			});
		}
		const toDelete = await db.select().from(material).where(eq(material.id, id)).get();
		if (!toDelete) {
			return fail(404, {
				delete: {
					success: false,
					message: "Material not found.",
				},
			});
		}
		const subjectId = await db
			.select({ id: subject.id })
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!subjectId) {
			return fail(404, {
				delete: {
					success: false,
					message: "Subject not found.",
				},
			});
		}
		try {
			await db
				.delete(material)
				.where(
					and(
						eq(material.id, id),
						eq(material.subjectId, subjectId.id),
						eq(material.chapter, chapter),
					),
				);
			if (toDelete.attachment) {
				await r2.delete(toDelete.attachment);
			}
		} catch (error) {
			console.error(error instanceof Error ? error.message : error);
			return fail(500, {
				delete: {
					success: false,
					message:
						error instanceof Error ? error.message : "Failed to delete material. Please try again.",
				},
			});
		}
		return redirect(302, `/subject/${subjectCode}/${chapter}`);
	},
};
