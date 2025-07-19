import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { material, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const { subjectCode } = event.params;
		const schoolId = event.locals.user.school;
		if (!schoolId) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const currentSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!currentSubject) {
			return error(404, "Subject not found");
		}
		const materialList = await db
			.select()
			.from(material)
			.where(eq(material.subjectId, currentSubject.id));
		return {
			subject: currentSubject,
			materials: materialList,
		};
	}
	return redirect(302, "/signin");
};
