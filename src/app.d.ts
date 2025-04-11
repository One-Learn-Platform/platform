// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { D1Database } from "@cloudflare/workers-types";

declare global {
	namespace App {
		interface Locals {
			user: import("$lib/server/auth").SessionValidationResult["user"];
			session: import("$lib/server/auth").SessionValidationResult["session"];
			DB: D1Database;
		}
		interface Platform {
			env: {
				DB: D1Database;
			};
		}
	}
}

export {};
