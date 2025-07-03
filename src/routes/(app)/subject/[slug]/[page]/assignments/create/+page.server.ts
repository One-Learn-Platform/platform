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
	const slug = event.params.slug;
	const schoolId = event.locals.user?.school;
	const page = Number(event.params.page);
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		if (event.locals.user.role === 3) {
			if (isNaN(page) || page < 1) {
				return error(400, "Invalid chapter");
			}
			if (!slug) {
				return error(400, "Invalid subject");
			}
			if (!schoolId) {
				return error(403, "Forbidden");
			}
			const db = getDb(event);
			const selectedSubject = await db
				.select()
				.from(subject)
				.where(and(eq(subject.code, slug), eq(subject.schoolId, schoolId)))
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
		const subjectId = event.params.slug;
		const chapter = Number(event.params.page);
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
			.select({ id: subject.id })
			.from(subject)
			.where(and(eq(subject.code, subjectId), eq(subject.schoolId, schoolId)))
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
		const attachmentArray: string[] = [];
		if (form.data.attachment) {
			const uploadPromises = form.data.attachment.map(async (file) => {
				try {
					const uniqueFileName = `assignment/${selectedSubject.id}/${chapter}/${getFileName(file.name)}-${getTimeStamp()}.${getFileExtension(file.name)}`;
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
		try {
			await db.insert(assignment).values({
				title: form.data.title,
				description: form.data.description,
				dueDate: form.data.dueDate,
				attachment: JSON.stringify(attachmentArray),
				chapter: Number(chapter),
				schoolId: schoolId,
				subjectId: selectedSubject.id,
			});
		} catch (error) {
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
		const currentAssignment = await db
			.select({ id: assignment.id })
			.from(assignment)
			.where(
				and(
					eq(assignment.subjectId, selectedSubject.id),
					eq(assignment.schoolId, schoolId),
					eq(assignment.chapter, chapter),
				),
			)
			.get();
		return redirect(
			303,
			`/subject/${event.params.slug}/${event.params.page}/assignments/${currentAssignment?.id}`,
		);
	},
};
