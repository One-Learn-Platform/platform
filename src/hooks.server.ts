import { building } from "$app/environment";
import * as auth from "$lib/server/auth.js";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const handleAuth: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
	}
	event.locals.DB = event.platform?.env.DB;
	event.locals.R2 = event.platform?.env.MEDIA;
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(event, sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth);
