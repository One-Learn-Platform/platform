import { building } from "$app/environment";
import { getAuth, toLocals } from "$lib/server/auth.js";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const handleAuth: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
	}
	event.locals.DB = event.platform?.env.DB;
	event.locals.R2 = event.platform?.env.MEDIA;

	// Refreshing and clearing the session cookie is handled by better-auth.
	const result = await getAuth(event).api.getSession({ headers: event.request.headers });
	const { user, session } = toLocals(result);

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth);
