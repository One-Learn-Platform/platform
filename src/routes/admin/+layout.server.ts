import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

import { count } from "drizzle-orm";
import { user, school } from "$lib/schema/db";

import { getDb } from "$lib/server/db";

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event);
	if (event.locals.user && (event.locals.user.role === 1 || event.locals.user.role === 2)) {
		return {
			user: event.locals.user,
			session: event.locals.session,
			userCount: await db.select({ count: count() }).from(user),
			schoolCount: await db.select({ count: count() }).from(school),
		};
	}
	return error(404, { message: "Not Found" });
};
