import { adminClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";
import type { Auth } from "$lib/server/auth";

// Browser-side client for better-auth's /api/auth/* routes.
// Not used yet: those routes are only served once `svelteKitHandler` is mounted in
// hooks.server.ts. Needed for browser-driven flows such as passkeys or OAuth sign-in.
// Keep the plugin list in step with the server config in $lib/server/auth.
export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<Auth>(), usernameClient(), adminClient()],
});
