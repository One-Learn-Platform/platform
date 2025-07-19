import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/grades/schema";
import { setError, superValidate, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { grades } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const userId = parseInt(slug, 10);

	if (event.locals.user) {
		if (event.locals.user.role === 1) {
			if (isNaN(userId)) {
				return error(400, { message: "Invalid User ID" });
			} else {
				const role = await db.select().from(grades).where(eq(grades.id, userId)).get();
				if (role) {
					return {
						roleData: role,
						form: await superValidate(zod4(formSchema)),
					};
				} else {
					return error(404, { message: "Role Not Found" });
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
		const roleId = parseInt(slug, 10);
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

		const prevRoleData = (await db.select().from(grades).where(eq(grades.id, roleId))).at(0);
		if (!prevRoleData)
			return fail(404, { edit: { success: false, data: null, message: "Role not found" }, form });

		try {
			await db
				.update(grades)
				.set({
					level: formData.level,
				})
				.where(eq(grades.id, roleId));
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
		if (event.url.searchParams.has("ref")) redirect(303, "/admin/role");
		else {
			return {
				edit: {
					success: true,
					data: {
						name: formData.level,
					},
					message: "User created successfully",
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
		const level = await db.select().from(grades).where(eq(grades.id, numberId)).get();
		if (!level) {
			return fail(404, {
				delete: {
					success: false,
					data: null,
					message: "Grade not found. Please try again.",
				},
			});
		}
		try {
			await db.delete(grades).where(eq(grades.id, numberId));
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
		return redirect(302, "/admin/grades");
	},
};
