import { fail, redirect } from "@sveltejs/kit";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";

import { TURNSTILE_SECRET_KEY } from "$env/static/private";
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	Throttler,
} from "$lib/server/auth";
import { validatePassword, validateUsername } from "$lib/server/auth-function";
import { getDb } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { validateToken } from "$lib/server/turnstile";

import type { Actions, PageServerLoad } from "./$types";

const throttler = new Throttler([1, 2, 4, 8, 16, 30, 60, 180, 300]); //in seconds

export const load: PageServerLoad = async (event) => {
	if (event.locals.user?.id) {
		return { user: event.locals.user };
	}
	return { user: null };
};

export const actions: Actions = {
	signin: async (event) => {
		const db = getDb(event);

		const formData = await event.request.formData();
		const username = formData.get("username");
		const password = formData.get("password");
		const captcha = formData.get("cf-turnstile-response");

		const { success } = await validateToken(captcha, TURNSTILE_SECRET_KEY);
		if (!success) {
			return fail(403, { captcha: "CAPTCHA Failed! Please try again" });
		}

		if (!validateUsername(username)) {
			return fail(400, {
				message: "Invalid username (min 3, max 31 characters, alphanumeric only)",
			});
		}
		if (!validatePassword(password)) {
			return fail(400, { message: "Invalid password (min 6, max 255 characters)" });
		}

		const results = await db.select().from(table.user).where(eq(table.user.username, username));

		const existingUser = results.at(0);
		// const ip = event.getClientAddress();
		const ip = "192.168.0"; //for testing

		if (!existingUser) {
			if (!throttler.consume(ip)) {
				return fail(429, { message: "Too many requests, Please try again later." });
			}
			return fail(400, { message: "Incorrect username or password" });
		}

		if (existingUser.password) {
			if (!throttler.consume(ip)) {
				return fail(429, { message: "Too many requests, Please try again later." });
			}

			const validPassword = await bcryptjs.compare(password, existingUser.password);
			if (!validPassword) {
				return fail(400, { message: "Incorrect username or password" });
			}
			throttler.reset(ip);
		} else {
			return fail(400, { message: "Unknown Error" });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(event, sessionToken, existingUser.id.toString());
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, "/profile");
	},
};
