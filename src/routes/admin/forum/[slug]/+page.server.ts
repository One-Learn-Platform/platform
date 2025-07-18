import { error, redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { forum, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const slug = Number(event.params.slug);

	if (event.locals.user && (event.locals.user.role === 1 || event.locals.user.role === 2)) {
		if (isNaN(slug) || slug <= 0) {
			return error(400, { message: "Invalid Forum ID" });
		} else {
			const { ...rest } = getTableColumns(forum);
			const forumData = await db
				.select({ ...rest, user: user.fullname })
				.from(forum)
				.where(eq(forum.id, slug))
				.leftJoin(user, eq(user.id, forum.userId))
				.get();
			if (forumData) {
				return {
					forumData: forumData,
				};
			} else {
				return error(404, { message: "Forum Not Found" });
			}
		}
	}
	return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	delete: async (event) => {
		const db = getDb(event);
		const form = await event.request.formData();
		const id = form.get("id");

		if (!id) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}
		const numberId = Number(id);
		if (isNaN(numberId)) {
			return fail(400, {
				delete: { success: false, data: null, message: "ID is not a number. Please try again." },
			});
		}
		try {
			const selectName = await db.select().from(forum).where(eq(forum.id, numberId));
			const name = selectName.at(0);
			if (!name) {
				return fail(404, {
					delete: {
						success: false,
						data: null,
						message: "Forum not found. Please try again.",
					},
				});
			}
			await db.delete(forum).where(eq(forum.id, numberId));
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}
		redirect(303, "/admin/forum");
	},
};
