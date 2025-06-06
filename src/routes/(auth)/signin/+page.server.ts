import type { Actions, PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";

import { TURNSTILE_SECRET_KEY } from "$env/static/private";
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	Throttler,
} from "$lib/server/auth";
import { validatePassword, validateUsername } from "$lib/server/auth-function";
import { getDb } from "$lib/server/db";
import { user } from "$lib/schema/db";
import { validateToken } from "$lib/server/turnstile";

const throttler = new Throttler([1, 2, 4, 8, 16, 30, 60, 180, 300]); //in seconds

export const load: PageServerLoad = async (event) => {
	if (event.locals.user?.id) {
		return { user: event.locals.user, form: await superValidate(zod4(formSchema)) };
	}
	return { form: await superValidate(zod4(formSchema)) };
};

export const actions: Actions = {
	signin: async (event) => {
		const db = getDb(event);

		const form = await superValidate(event, zod4(formSchema));
		const username = form.data.username;
		const password = form.data.password;
		const captcha = form.data["cf-turnstile-response"];

		const { success } = await validateToken(captcha, TURNSTILE_SECRET_KEY);
		if (!success) {
			setError(form, "", "CAPTCHA Failed! Please refresh the page");
			return fail(403, { captcha: "CAPTCHA Failed! Please refresh the page", form });
		}

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		if (!validateUsername(username)) {
			console.error("Invalid username:", username);
			setError(form, "username", "Invalid username (min 3, max 31 characters, alphanumeric only)");
			return fail(400, {
				message: "Invalid username (min 3, max 31 characters, alphanumeric only)",
				form,
			});
		}
		if (!validatePassword(password)) {
			setError(form, "password", "Invalid password (min 6, max 255 characters)");
			return fail(400, { message: "Invalid password (min 6, max 255 characters)", form });
		}

		const existingUser = await db.select().from(user).where(eq(user.username, username)).get();

		// const ip = event.getClientAddress();
		const ip = "192.168.0"; //for testing

		if (!existingUser) {
			if (!throttler.consume(ip)) {
				setError(form, "", "Too many requests, please try again later.");
				return fail(429, { message: "Too many requests, Please try again later.", form });
			}
			setError(form, "", "Incorrect username or password");
			return fail(400, { message: "Incorrect username or password", form });
		}

		if (existingUser.password) {
			if (!throttler.consume(ip)) {
				setError(form, "", "Too many requests, please try again later.");
				return fail(429, { message: "Too many requests, Please try again later.", form });
			}

			const validPassword = await bcryptjs.compare(password, existingUser.password);
			if (!validPassword) {
				setError(form, "", "Incorrect username or password");
				return fail(400, { message: "Incorrect username or password", form });
			}
			throttler.reset(ip);
		} else {
			setError(form, "", "Unknown Error, please try again later");
			return fail(400, { message: "Unknown Error", form });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(event, sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		if (existingUser.roleId === 0 || existingUser.roleId === 1) return redirect(302, "/admin");

		return redirect(302, "/");
	},
};
