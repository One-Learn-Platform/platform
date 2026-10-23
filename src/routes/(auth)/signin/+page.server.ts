import type { Actions, PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";

import { signInUsername } from "#lib/server/auth.js";
import { validatePassword, validateUsername } from "#lib/server/auth-function.js";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user?.id) {
		return { user: event.locals.user, form: await superValidate(zod4(formSchema)) };
	}
	return { form: await superValidate(zod4(formSchema)) };
};

export const actions: Actions = {
	signin: async (event) => {
		const form = await superValidate(event, zod4(formSchema));
		const username = form.data.username;
		const password = form.data.password;

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				login: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		if (!validateUsername(username)) {
			console.error("Invalid username:", username);
			setError(form, "username", "Invalid username (min 3, max 31 characters, alphanumeric only)");
			return fail(400, {
				login: {
					success: false,
					data: null,
					message: "Invalid username (min 3, max 31 characters, alphanumeric only)",
				},
				form,
			});
		}
		if (!validatePassword(password)) {
			setError(form, "password", "Invalid password (min 6, max 255 characters)");
			return fail(400, {
				login: {
					success: false,
					data: null,
					message: "Invalid password (min 6, max 255 characters)",
				},
				form,
			});
		}

		// better-auth hashes the password even for unknown usernames, so the
		// response time doesn't reveal whether the username exists.
		const result = await signInUsername(event, { username, password });
		if (!result.ok && result.reason === "rate-limited") {
			setError(form, "", "Too many requests, please try again later.");
			return fail(429, {
				login: {
					success: false,
					data: null,
					message: "Too many requests, Please try again later.",
				},
				form,
			});
		}
		if (!result.ok) {
			setError(form, "", "Incorrect username or password");
			return fail(400, {
				login: { success: false, data: null, message: "Incorrect username or password" },
				form,
			});
		}
		const { roleId } = result.user;

		if (roleId === 1 || roleId === 2) return redirect(302, "/admin");

		return redirect(302, "/");
	},
};
