import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

import { count } from "drizzle-orm";
import * as table from "$lib/server/db/schema";

import { getDb } from "$lib/server/db";

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event);
	if (event.locals.user && (event.locals.user.role === 0 || event.locals.user.role === 1)) {
		return {
			user: event.locals.user,
			session: event.locals.session,
			userCount: await db.select({ count: count() }).from(table.user),
			schoolCount: await db.select({ count: count() }).from(table.school),
		};
	}
	return error(404, { message: "Not Found" });
};
