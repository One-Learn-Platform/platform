import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { forum, subject } from "$lib/schema/db";
import { formSchemaCreate } from "$lib/schema/forum/schema";
import { getR2 } from "$lib/server/r2";
import { getDb } from "$lib/server/db";
import { and, eq } from "drizzle-orm";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { getFileExtension, getTimeStamp } from "$lib/utils";
import { getFileName } from "$lib/functions/material";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return {
			form: await superValidate(event, zod4(formSchemaCreate)),
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
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		if (isNaN(chapter) || chapter < 1) {
			return fail(400, {
				create: {
					success: false,
					message: "Invalid chapter",
				},
			});
		}
		const form = await superValidate(event, zod4(formSchemaCreate));
		if (event.locals.user.role === 2 || event.locals.user.role === 1) {
			setError(form, "", "You are not allowed to create a forum post.");
			return fail(403, {
				create: {
					success: false,
					message: "You are not allowed to create a forum post.",
				},
				form,
			});
		}
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

		let attachment;
		let forumId;
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
				const uniqueFileName = `subject/${subjectId.id}/${chapter}/${getFileName(form.data.attachment.name)}-${getTimeStamp()}.${getFileExtension(form.data.attachment.name)}`;
				attachment = uniqueFileName;
				const attachmentBuffer = await form.data.attachment.arrayBuffer();
				await r2.put(uniqueFileName, attachmentBuffer);
			}
			forumId = await db
				.insert(forum)
				.values({
					title: form.data.title,
					description: form.data.description,
					chapter: chapter,
					schoolId: schoolId,
					attachment: attachment,
					subjectId: subjectId?.id,
					userId: userId,
				})
				.returning()
				.get();
		} catch (error) {
			if (attachment) {
				await r2.delete(attachment);
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
		return redirect(302, `/subject/${subjectCode}/${chapter}/forum/${forumId.id}`);
	},
};
