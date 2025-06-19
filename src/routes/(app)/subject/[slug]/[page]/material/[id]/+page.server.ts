import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { material } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const page = Number(event.params.page);
		const id = Number(event.params.id);

		if (isNaN(page) || page < 1) {
			return error(400, "Invalid chapter");
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
