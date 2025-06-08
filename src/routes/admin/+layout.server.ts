import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

import { school, user } from "$lib/schema/db";
import { asc, count, getTableColumns } from "drizzle-orm";

import { getDb } from "$lib/server/db";

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event);
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...rest } = getTableColumns(user);
			const allUsers = await db
				.select({ ...rest })
				.from(user)
				.orderBy(asc(user.createdAt));
			return {
				user: event.locals.user,
				session: event.locals.session,
				userCount: await db.select({ count: count() }).from(user).get(),
				schoolCount: await db.select({ count: count() }).from(school).get(),
				allUsers: allUsers,
			};
		} else {
			return error(404, { message: "Not Found" });
		}
	}
	return redirect(302, "/signin");
};
