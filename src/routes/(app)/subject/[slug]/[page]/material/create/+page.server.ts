import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { material, subject } from "$lib/schema/db";
import { formSchema } from "$lib/schema/material/schema";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileExtension, getFileName, getTimeStamp } from "$lib/utils";

import { and, eq } from "drizzle-orm";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return {
			form: await superValidate(event, zod4(formSchema)),
		};
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const r2 = getR2(event);
		const userId = event.locals.user.id;
		const schoolId = event.locals.user.school;
		const subjectCode = event.params.slug;
		const chapter = event.params.page;
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
		let uploadError;
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
			await db.insert(material).values({
				title: form.data.title,
				description: form.data.description,
				content: form.data.content,
				attachment: JSON.stringify(attachmentArray),
				chapter: Number(chapter),
				schoolId: schoolId,
				subjectId: subjectId?.id,
			});
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

		return redirect(302, `/subject/${subjectCode}/${chapter}`);
	},
};
