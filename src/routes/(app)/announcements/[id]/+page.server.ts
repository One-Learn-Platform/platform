import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { announcement } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const id = Number(event.params.id);

		const selectedAnnouncement = await db
			.select()
			.from(announcement)
			.where(eq(announcement.id, id))
			.get();

		if (!selectedAnnouncement) {
			return error(404, "Announcement not found");
		}

		return {
			announcement: selectedAnnouncement,
		};
	}
	return redirect(302, "/signin");
};
