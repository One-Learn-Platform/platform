import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

import { getDb } from "$lib/server/db";
import { announcement } from "$lib/schema/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const schoolId = Number(event.locals.user.school);
		let allAnnouncements;
		if (schoolId) {
			allAnnouncements = await db
				.select()
				.from(announcement)
				.where(eq(announcement.schoolId, schoolId));
		} else {
			allAnnouncements = await db.select().from(announcement);
		}
		return {
			announcements: allAnnouncements,
		};
	}
	return redirect(302, "/login");
};
