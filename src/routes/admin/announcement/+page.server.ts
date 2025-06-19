import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/announcement/schema";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { announcement } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, or } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			const schoolId = Number(event.locals.user.school);
			if (isNaN(schoolId)) {
				return error(400, { message: "Invalid School ID" });
			}
			const allAnnouncement = await db
				.select()
				.from(announcement)
				.where(eq(announcement.schoolId, schoolId));
			return {
				announcement: allAnnouncement,
				form: await superValidate(zod4(formSchema)),
			};
		}
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const schoolId = Number(event.locals.user.school);
		const form = await superValidate(event, zod4(formSchema));
		if (isNaN(schoolId)) {
			return fail(400, {
				create: { success: false, data: null, message: "Invalid School ID" },
			});
		}

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		try {
			await db.insert(announcement).values({
				title: form.data.title,
				content: form.data.content,
				startDate: form.data.startDate,
				endDate: form.data.endDate,
				schoolId: Number(event.locals.user.school),
			});
			return {
				create: { success: true, data: { name: form.data.title }, message: null },
				form,
			};
		} catch (error) {
			console.error(error);
			setError(form, "", error instanceof Error ? error.message : "Unknown error", { status: 500 });
			return fail(500, {
				create: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error, please try again.",
				},
				form,
			});
		}
	},

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
			const name = await db.select().from(announcement).where(eq(announcement.id, numberId)).get();
			await db.delete(announcement).where(eq(announcement.id, numberId));
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
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
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

		const invalidIds = idArray.filter((id) => isNaN(id));
		if (invalidIds.length > 0) {
			return fail(400, {
				delete: {
					success: false,
					data: null,
					message: "IDs are not valid numbers. Please try again.",
				},
			});
		}

		try {
			const announcementArray = await db
				.select()
				.from(announcement)
				.where(or(...idArray.map((id) => eq(announcement.id, id))));
			const announcementTitleArray = announcementArray.map((announcement) => announcement.title);

			await db.delete(announcement).where(or(...idArray.map((id) => eq(announcement.id, id))));

			return {
				delete: {
					success: true,
					data: {
						id: idArray.join(","),
						name: announcementTitleArray.join(", "),
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
					message: error instanceof Error ? error.message : "Unknown error, please try again.",
				},
			});
		}
	},
};
