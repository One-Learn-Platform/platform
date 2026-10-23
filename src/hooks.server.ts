import { building } from "$app/env";
import { getAuth, toLocals } from "#lib/server/auth.js";
import { sequence, type Handle } from "@sveltejs/kit/hooks";

const handleAuth: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
	}
	// Imported lazily: adapter-cloudflare loads the server bundle in Node to generate the
	// SPA fallback page, and Node cannot resolve a static "cloudflare:workers" import.
	const { env } = await import("cloudflare:workers");
	event.locals.DB = env.DB;
	event.locals.R2 = env.MEDIA;

	// Refreshing and clearing the session cookie is handled by better-auth.
	const result = await getAuth(event).api.getSession({ headers: event.request.headers });
	const { user, session } = toLocals(result);

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth);
