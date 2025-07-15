import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { material, subject } from "$lib/schema/db";
import { formSchema } from "$lib/schema/material/schema";
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
		return {
			material: selectedMaterial,
			form: await superValidate(event, zod4(formSchema)),
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
		const form = await superValidate(event, zod4(formSchema));
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
		const attachmentArray: string[] = [];
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
				.where(and(eq(material.subjectId, subjectId.id), eq(material.chapter, chapter)))
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
			const existingAttachments: string[] = [];
			if (beforeMaterial.attachment) {
				const existing = JSON.parse(beforeMaterial.attachment);
				existingAttachments.push(...existing);
			}
			let uniqueThumbnailName = "";
			if (form.data.thumbnail) {
				uniqueThumbnailName = `subject/${subjectId.id}/${chapter}/thumbnail/${getFileName(form.data.thumbnail.name)}-${getTimeStamp()}.${getFileExtension(form.data.thumbnail.name)}`;
				const fileBuffer = await form.data.thumbnail.arrayBuffer();
				try {
					await r2.put(uniqueThumbnailName, fileBuffer);
				} catch (error) {
					setError(
						form,
						"thumbnail",
						error instanceof Error ? error.message : "Failed to upload thumbnail",
					);
					console.error(error instanceof Error ? error.message : error, form.data.thumbnail.name);
					throw new Error(
						`Failed to upload thumbnail: ${form.data.thumbnail.name}. Please try again.`,
					);
				}
			}
			if (form.data.attachment) {
				const uploadPromises = form.data.attachment.map(async (file) => {
					try {
						const uniqueFileName = `subject/${subjectId.id}/${chapter}/${getFileName(file.name)}-${getTimeStamp()}.${getFileExtension(file.name)}`;
						attachmentArray.push(uniqueFileName);
						const fileBuffer = await file.arrayBuffer();
						await r2.put(uniqueFileName, fileBuffer);
						return { success: true };
					} catch (error) {
						console.error("Error uploading file:", error, file.name);
						return { success: false, fileName: file.name };
					}
				});
				const results = await Promise.all(uploadPromises);
				const failures = results.filter((result) => !result.success);
				if (failures.length > 0) {
					throw new Error(
						`Failed to upload files: ${failures.map((f) => f.fileName).join(", ")}. Please try again.`,
					);
				}
			}
			await db
				.update(material)
				.set({
					title: form.data.title,
					description: form.data.description,
					thumbnail: form.data.thumbnail ? uniqueThumbnailName : undefined,
					content: form.data.content,
					attachment: JSON.stringify(attachmentArray.concat(existingAttachments)),
				})
				.where(and(eq(material.subjectId, subjectId.id), eq(material.chapter, chapter)));
		} catch (error) {
			await Promise.all(
				attachmentArray.map(async (element) => {
					await r2.delete(element);
				}),
			);
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
				const attachments = JSON.parse(toDelete.attachment);
				await Promise.all(
					attachments.map(async (attachment: string) => {
						await r2.delete(attachment);
					}),
				);
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
	deleteAttachment: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const r2 = getR2(event);
		const formData = await event.request.formData();
		const name = formData.get("attachment_name");
		const schoolId = event.locals.user.school;
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		if (name === null || typeof name !== "string" || name.trim() === "") {
			return fail(400, {
				deleteAttachment: {
					success: false,
					message: "Attachment name is required.",
				},
			});
		}
		if (!schoolId) {
			return fail(400, {
				deleteAttachment: {
					success: false,
					message: "School ID is required.",
				},
			});
		}
		if (isNaN(chapter)) {
			return fail(400, {
				deleteAttachment: {
					success: false,
					message: "Invalid chapter number.",
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
				deleteAttachment: {
					success: false,
					message: "Subject not found.",
				},
			});
		}
		const oldAttachment = await db
			.select({ attachment: material.attachment })
			.from(material)
			.where(and(eq(material.subjectId, subjectId.id), eq(material.chapter, chapter)))
			.get();
		if (!oldAttachment?.attachment) {
			return fail(404, {
				deleteAttachment: {
					success: false,
					message: "Material not found or has no attachments.",
				},
			});
		}
		const attachments = JSON.parse(oldAttachment.attachment);
		if (!attachments.includes(name)) {
			return fail(404, {
				deleteAttachment: {
					success: false,
					message: "Attachment not found.",
				},
			});
		}
		try {
			await r2.delete(name);
			const updatedAttachments = attachments.filter((attachment: string) => attachment !== name);
			await db
				.update(material)
				.set({ attachment: JSON.stringify(updatedAttachments) })
				.where(and(eq(material.subjectId, subjectId.id), eq(material.chapter, chapter)));
		} catch (error) {
			console.error(error instanceof Error ? error.message : error);
			return fail(500, {
				deleteAttachment: {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "Failed to delete attachment. Please try again.",
				},
			});
		}
		return {
			deleteAttachment: {
				success: true,
				message: "Attachment deleted successfully.",
			},
		};
	},
};
