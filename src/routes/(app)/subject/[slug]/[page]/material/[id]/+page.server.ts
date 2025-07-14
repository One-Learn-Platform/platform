import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { material, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { and, eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const page = Number(event.params.page);
		const id = Number(event.params.id);
		if (isNaN(page) || page < 1) {
			return error(400, "Invalid chapter");
		}
		if (isNaN(id) || id < 1) {
			return error(400, "Invalid material ID");
		}
		const selectedMaterial = await db
			.select()
			.from(material)
			.where(and(eq(material.id, id), eq(material.chapter, page)))
			.get();
		return {
			material: selectedMaterial,
		};
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	delete: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const r2 = getR2(event);
		const formData = await event.request.formData();
		const id = Number(formData.get("id"));
		const subjectCode = event.params.slug;
		const schoolId = event.locals.user.school;
		const chapter = Number(event.params.page);
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
};
