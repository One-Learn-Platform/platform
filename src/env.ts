import { building } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	PUBLIC_R2_URL: { public: true, static: true },
	BETTER_AUTH_SECRET: {
		description: "Secret used by better-auth to sign sessions",
		// Not needed while building/prerendering, but required once the app runs
		schema: (value) => {
			if (!value && !building) throw new Error("BETTER_AUTH_SECRET is not set");
			return value ?? "";
		},
	},
});
