import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { forum, material, user, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, getTableColumns, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			const { ...rest } = getTableColumns(forum);
			let forumList;
			if (event.locals.user.school) {
				forumList = await db
					.select({ ...rest, user: user.fullname, subject: subject.name })
					.from(forum)
					.where(eq(forum.schoolId, event.locals.user.school))
					.leftJoin(user, eq(forum.userId, user.id))
					.leftJoin(subject, eq(forum.subjectId, subject.id));
			} else {
				forumList = await db
					.select({ ...rest, user: user.fullname, subject: subject.name })
					.from(forum)
					.leftJoin(user, eq(user.id, forum.userId))
					.leftJoin(subject, eq(subject.id, forum.subjectId));
			}
			return {
				forumList: forumList,
			};
		}
	} else {
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/sigin");
};

export const actions: Actions = {
	delete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const id = formData.get("id");

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
			const name = await db.select().from(forum).where(eq(forum.id, numberId)).get();
			await db.delete(forum).where(eq(forum.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: name?.title,
					},
					message: null,
				},
			};
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
	},
	multidelete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const ids = formData.get("ids");
		const idArray = ids
			?.toString()
			.split(",")
			.map((id) => Number(id));

		if (!idArray) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}

		const forumArray = await db
			.select()
			.from(forum)
			.where(or(...idArray.map((id) => eq(forum.id, id))));
		const forumNameArray = forumArray.map((forum) => forum.title);

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			try {
				await db.delete(forum).where(eq(forum.id, id));
			} catch (error) {
				console.error(error);
				return fail(500, {
					delete: {
						success: false,
						data: null,
						message: error instanceof Error ? error.message : "Unknown error, please try again.",
					},
				});
			}
		});

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					name: forumNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
