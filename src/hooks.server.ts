import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import * as auth from "$lib/server/auth.js";

import { i18n } from "$lib/i18n";

const handleAuth: Handle = async ({ event, resolve }) => {
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

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleAuth, handleParaglide);
