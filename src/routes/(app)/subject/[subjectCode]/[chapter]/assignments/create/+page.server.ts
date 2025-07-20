import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/assignment/schema";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { assignment, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileExtension, getFileName, getTimeStamp } from "$lib/utils";
import { and, eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const { subjectCode } = event.params;
	const schoolId = event.locals.user?.school;
	const chapter = Number(event.params.chapter);
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		if (event.locals.user.role === 3) {
			if (isNaN(chapter) || chapter < 1) {
				return error(400, "Invalid chapter");
			}
			if (!subjectCode) {
				return error(400, "Invalid subject");
			}
			if (!schoolId) {
				return error(403, "Forbidden");
			}
			const db = getDb(event);
			const selectedSubject = await db
				.select()
				.from(subject)
				.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
				.get();
			if (!selectedSubject) {
				return error(404, "Subject not found");
			}
			return { subject: selectedSubject, form: await superValidate(event, zod4(formSchema)) };
		}
		return error(404, "Not found");
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.user) {
			return error(403, "Forbidden");
		}

		const form = await superValidate(event, zod4(formSchema));
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		const schoolId = event.locals.user.school;
		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		if (!schoolId) {
			return error(403, "Forbidden");
		}
		if (!form.valid) {
			setError(form, "", "Invalid form data");
			return fail(400, {
				create: {
					success: false,
					message: "Invalid form data",
				},
				form,
			});
		}
		const db = getDb(event);
		const selectedSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();

		if (!selectedSubject) {
			return fail(404, {
				create: {
					success: false,
					message: "Subject not found",
				},
				form,
			});
		}
		const r2 = getR2(event);
		let attachment;
		if (form.data.attachment) {
			try {
				const uniqueFileName = `subject/${selectedSubject.code}/${chapter}/assignment/${getFileName(form.data.attachment.name)}-${getTimeStamp()}.${getFileExtension(form.data.attachment.name)}`;
				attachment = uniqueFileName;
				const fileBuffer = await form.data.attachment.arrayBuffer();
				await r2.put(uniqueFileName, fileBuffer);
			} catch (error) {
				console.error("Error uploading file:", error, form.data.attachment.name);
				setError(form, "attachment", "Failed to upload file");
				return fail(500, {
					create: {
						success: false,
						message: `Failed to upload file: ${form.data.attachment.name}. Please try again.`,
					},
					form,
				});
			}
		}
		if (form.data.startDate && new Date(form.data.dueDate) < new Date(form.data.startDate)) {
			setError(form, "dueDate", "Due date must be after start date");
			return fail(400, {
				create: {
					success: false,
					message: "Due date must be after start date",
				},
				form,
			});
		}

		let currentAssignment;
		try {
			currentAssignment = await db
				.insert(assignment)
				.values({
					title: form.data.title,
					description: form.data.description,
					dueDate: form.data.dueDate,
					attachment: attachment,
					quiz: form.data.quiz,
					limitUser: form.data.limitUser ? form.data.limitUser : undefined,
					startDate: form.data.startDate ? form.data.startDate : undefined,
					chapter: Number(chapter),
					schoolId: schoolId,
					subjectId: selectedSubject.id,
				})
				.returning()
				.get();
		} catch (error) {
			if (attachment) {
				await r2.delete(attachment);
			}
			console.error("Error inserting assignment:", error);
			setError(form, "", error instanceof Error ? error.message : "Failed to create assignment");
			return fail(500, {
				create: {
					success: false,
					message: error instanceof Error ? error.message : "Failed to create assignment",
				},
				form,
			});
		}
		return redirect(
			303,
			`/subject/${event.params.subjectCode}/${event.params.chapter}/assignments/${currentAssignment.id}`,
		);
	},
};
