import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/announcement/schema";
import { setError, superValidate, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { announcement } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const { slug } = event.params;
			const announcementId = Number(slug);
			if (isNaN(announcementId)) {
				return error(400, { message: "Invalid Announcement ID" });
			} else {
				const db = getDb(event);
				const selectedAnnouncement = await db
					.select()
					.from(announcement)
					.where(eq(announcement.id, announcementId))
					.get();
				if (selectedAnnouncement) {
					return {
						announcementData: selectedAnnouncement,
						form: await superValidate(zod4(formSchema)),
					};
				} else {
					return error(404, { message: "Announcement Not Found" });
				}
			}
		} else {
			return error(404, { message: "Not Found" });
		}
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const announcementId = parseInt(slug, 10);
		const form = await superValidate(event, zod4(formSchema), {
			id: "edit",
		});
		const formData = form.data;

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		const prevAnnouncementData = (
			await db.select().from(announcement).where(eq(announcement.id, announcementId))
		).at(0);
		if (!prevAnnouncementData)
			return fail(404, {
				edit: { success: false, data: null, message: "Announcement not found" },
				form,
			});

		try {
			await db
				.update(announcement)
				.set({
					title: formData.title,
					content: formData.content,
					startDate: formData.startDate,
					endDate: formData.endDate,
				})
				.where(eq(announcement.id, announcementId));
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
		if (event.url.searchParams.has("ref")) redirect(303, "/admin/announcement");
		else {
			return {
				edit: {
					success: true,
					data: {
						title: formData.title,
					},
					message: "Announcement edited successfully",
				},
				form,
			};
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
			const title = await db.select().from(announcement).where(eq(announcement.id, numberId)).get();
			if (!title) {
				return fail(404, {
					delete: {
						success: false,
						data: null,
						message: "Announcement not found. Please try again.",
					},
				});
			}
			await db.delete(announcement).where(eq(announcement.id, numberId));
			redirect(302, "/admin/announcement");
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
