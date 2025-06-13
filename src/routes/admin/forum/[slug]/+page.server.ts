import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaEdit } from "$lib/schema/forum/schema";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { forum, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, getTableColumns } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const schoolId = parseInt(slug, 10);

	if (event.locals.user && (event.locals.user.role === 1 || event.locals.user.role === 2)) {
		if (isNaN(schoolId)) {
			return error(400, { message: "Invalid School ID" });
		} else {
			const { ...rest } = getTableColumns(forum);
			const forumData = await db
				.select({ ...rest, user: user.fullname })
				.from(forum)
				.where(eq(forum.id, schoolId))
				.leftJoin(user, eq(user.id, forum.userId))
				.get();
			if (forumData) {
				return {
					forumData: forumData,
					form: await superValidate(zod4(formSchemaEdit)),
				};
			} else {
				return error(404, { message: "Forum Not Found" });
			}
		}
	}
	return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const form = await superValidate(event, zod4(formSchemaEdit));
		const forumId = Number(slug);
		const userId = Number(form.data.userId);

		if (!event.locals.user) {
			return error(404, { message: "Not Found" });
		}
		if (event.locals.user.role !== 1 && event.locals.user.role !== 2) {
			return error(403, { message: "Forbidden" });
		}
		if (!event.locals.user.school) {
			setError(form, "", "You are not associated with any school");
			return fail(400, {
				edit: { success: false, data: null, message: "You are not associated with any school" },
				form,
			});
		}

		if (isNaN(forumId) || forumId <= 0) {
			setError(form, "", "Invalid forum ID, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Invalid forum ID, please try again" },
				form,
			});
		}

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		if (isNaN(userId) || userId <= 0) {
			setError(form, "userId", "Invalid user ID, please select a valid user");
			return fail(400, {
				edit: {
					success: false,
					data: null,
					message: "Invalid user ID, please select a valid user",
				},
				form,
			});
		}
		if (event.locals.user.school !== form.data.schoolId) {
			setError(
				form,
				"schoolId",
				"You cannot edit this forum, please select a forum from your school",
			);
			return fail(400, {
				edit: {
					success: false,
					data: null,
					message: "You cannot edit this forum, please select a forum from your school",
				},
				form,
			});
		}
		const userData = await db.select().from(user).where(eq(user.id, userId)).get();
		if (!userData) {
			setError(form, "userId", "User not found, please select a valid user");
			return fail(404, {
				edit: {
					success: false,
					data: null,
					message: "User not found, please select a valid user",
				},
				form,
			});
		}

		try {
			await db
				.update(forum)
				.set({
					title: form.data.title,
					description: form.data.description,
				})
				.where(eq(forum.id, forumId));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				edit: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}

		if (event.url.searchParams.has("ref")) redirect(303, "/admin/user");
		else {
			return withFiles({
				edit: {
					success: true,
					data: {
						name: form.data.title,
					},
					message: "User created successfully",
				},
				form,
			});
		}
	},
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
			redirect(303, "/admin/forum");
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
};
