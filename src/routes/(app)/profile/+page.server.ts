import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import {
	formSchemaPassOnly,
	formSchemaUploadImage,
	formSchemaWithoutPass,
} from "$lib/schema/user/schema";
import bcryptjs from "bcryptjs";
import { eq, getTableColumns } from "drizzle-orm";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import * as table from "$lib/schema/db";
import { validatePassword } from "$lib/server/auth-function";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileName, getTimeStamp } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);

	if (event.locals.user) {
		const { password, ...rest } = getTableColumns(table.user);
		const user = await db
			.select({ ...rest })
			.from(table.user)
			.where(eq(table.user.id, event.locals.user.id))
			.get();
		const schoolList = await db.select().from(table.school);
		if (user) {
			return {
				userData: user,
				schoolList: schoolList,
				form: await superValidate(zod4(formSchemaWithoutPass)),
				uploadForm: await superValidate(zod4(formSchemaUploadImage)),
				passForm: await superValidate(zod4(formSchemaPassOnly)),
			};
		}
	}
	return redirect(303, "/login");
};

export const actions: Actions = {
	edit: async (event) => {
		if (!event.locals.user) {
			return redirect(303, "/login");
		}

		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchemaWithoutPass), {
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

		let roleId = 0;
		switch (formData.roleId) {
			case "super admin":
				roleId = 1;
				break;
			case "admin":
				roleId = 2;
				break;
			case "teacher":
				roleId = 3;
				break;
			case "student":
				roleId = 4;
				break;
			default:
				break;
		}

		const prevUserData = (
			await db.select().from(table.user).where(eq(table.user.id, event.locals.user.id))
		).at(0);
		if (!prevUserData) return fail(404, { message: "User not found" });

		if (prevUserData.username !== formData.username) {
			try {
				const existingUser = await db
					.select()
					.from(table.user)
					.where(eq(table.user.username, formData.username));
				if (existingUser.at(0)) {
					setError(form, "username", "Username already exists");
					return fail(400, {
						edit: { success: false, data: null, message: "Username already exists" },
						form,
					});
				}
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
		}

		try {
			await db
				.update(table.user)
				.set({
					fullname: formData.fullname,
					username: formData.username,
					dob: formData.dob,
					roleId: roleId,
				})
				.where(eq(table.user.id, event.locals.user.id));
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
		return {
			edit: {
				success: true,
				data: {
					fullname: formData.fullname,
				},
				message: "User created successfully",
			},
			form,
		};
	},
	upload: async (event) => {
		if (!event.locals.user) {
			return redirect(303, "/login");
		}

		const db = getDb(event);
		const r2 = getR2(event);
		const form = await superValidate(event, zod4(formSchemaUploadImage));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				upload: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}
		const user = await db
			.select()
			.from(table.user)
			.where(eq(table.user.id, event.locals.user.id))
			.get();
		if (!user) {
			return fail(404, { message: "User not found" });
		}
		const uniqueFileName = `user/avatar/${getFileName(user?.username)}-${getTimeStamp()}.png`;
		const fileBuffer = await form.data.avatar.arrayBuffer();
		try {
			await r2.put(uniqueFileName, fileBuffer, {
				httpMetadata: {
					contentType: form.data.avatar.type,
				},
			});
		} catch (r2Error) {
			console.error("Failed to upload to R2:", r2Error);
			return fail(500, {
				create: { success: false, data: null, message: "Failed to upload file" },

				form,
			});
		}
		const imageUrl = (await getR2(event).get(uniqueFileName))?.key;

		try {
			await db
				.update(table.user)
				.set({
					avatar: imageUrl,
				})
				.where(eq(table.user.id, event.locals.user.id));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				upload: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}
		if (event.url.searchParams.has("ref")) redirect(303, "/admin/user");
		return withFiles({
			upload: {
				success: true,
				data: {
					fullname: user?.fullname,
					avatar: imageUrl,
				},
				message: "Avatar updated successfully",
			},
			form,
		});
	},
	changePassword: async (event) => {
		if (!event.locals.user) {
			return redirect(303, "/login");
		}
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchemaPassOnly));

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				changePassword: {
					success: false,
					data: null,
					message: "Content is invalid, please try again",
				},
				form,
			});
		}

		if (!validatePassword(form.data.passwordOld)) {
			setError(
				form,
				"passwordOld",
				"Invalid password (min 6, max 255 characters, must contain letters and numbers)",
			);
		}
		const user = await db
			.select()
			.from(table.user)
			.where(eq(table.user.id, event.locals.user.id))
			.get();
		if (!user) {
			return fail(404, {
				changePassword: { success: false, data: null, message: "User not found" },
				form,
			});
		}
		const validPassword = await bcryptjs.compare(form.data.passwordOld, user.password);
		if (!validPassword) {
			setError(form, "passwordOld", "Incorrect password");
			return fail(400, {
				changePassword: {
					success: false,
					data: null,
					message: "Incorrect password",
				},
				form,
			});
		}
		if (!validatePassword(form.data.password)) {
			setError(
				form,
				"password",
				"Invalid password (min 6, max 255 characters, must contain letters and numbers)",
			);
		}
		if (!validatePassword(form.data.passwordConfirm)) {
			setError(
				form,
				"passwordConfirm",
				"Invalid password (min 6, max 255 characters, must contain letters and numbers)",
			);
			return fail(400, {
				changePassword: {
					success: false,
					data: null,
					message: "Invalid password (min 6, max 255 characters, must contain letters and numbers)",
				},
				form,
			});
		}
		if (form.data.password !== form.data.passwordConfirm) {
			setError(form, "passwordConfirm", "Passwords do not match");
			return fail(400, {
				changePassword: {
					success: false,
					data: null,
					message: "Passwords do not match",
				},
				form,
			});
		}

		try {
			await db
				.update(table.user)
				.set({
					password: await bcryptjs.hash(form.data.password, 10),
				})
				.where(eq(table.user.id, event.locals.user.id));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				changePassword: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}
		return {
			changePassword: {
				success: true,
				data: {
					fullname: user.fullname,
				},
				message: "Password changed successfully",
			},
			form,
		};
	},
	deleteAvatar: async (event) => {
		const db = getDb(event);
		const r2 = getR2(event);
		const formData = await event.request.formData();
		const id = formData.get("avatarId");

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
		const user = await db.select().from(table.user).where(eq(table.user.id, numberId)).get();
		if (!user) {
			return fail(404, {
				delete: {
					success: false,
					data: null,
					message: "User not found. Please try again.",
				},
			});
		}
		if (user.avatar === null || user.avatar === "") {
			return fail(400, {
				delete: {
					success: false,
					data: null,
					message: "User does not have an avatar to delete.",
				},
			});
		}

		try {
			await r2.delete(user.avatar);
		} catch (error) {
			console.error("Failed to delete avatar from R2:", error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}

		try {
			await db
				.update(table.user)
				.set({
					avatar: null,
				})
				.where(eq(table.user.id, numberId));
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
		return {
			delete: {
				success: true,
				data: {
					fullname: user.fullname,
				},
				message: "Avatar deleted successfully",
			},
		};
	},
};
