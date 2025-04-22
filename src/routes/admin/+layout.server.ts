import type { LayoutServerLoad } from "./$types";

import { count } from "drizzle-orm";
import * as table from "$lib/server/db/schema";

import { getDb } from "$lib/server/db";

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event);
	return {
		role: event.locals.user?.role,
		userCount: await db.select({ count: count() }).from(table.user),
		schoolCount: await db.select({ count: count() }).from(table.school),
	};
};
