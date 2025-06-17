import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";

import { getDb } from "$lib/server/db";
import { forum, user } from "$lib/schema/db";
import { and, eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const page = Number(event.params.page);
		const id = Number(event.params.id);

		if (isNaN(page) || page < 1) {
			return error(400, "Invalid chapter");
		}
		const forumColumns = getTableColumns(forum);
		const selectedForum = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
			})
			.from(forum)
			.where(and(eq(forum.chapter, page), eq(forum.id, id)))
			.leftJoin(user, eq(forum.userId, user.id))
			.get();
		if (!selectedForum) {
			return error(404, "Forum not found");
		}
		return {
			forum: selectedForum,
			form: await superValidate(zod4(formSchema)),
		};
	}
	return redirect(302, "/signin");
};
