// Bindings from wrangler.json. adapter-cloudflare no longer exposes them on `platform`,
// so they are read from the `cloudflare:workers` module instead.
declare module "cloudflare:workers" {
	export const env: {
		DB: import("@cloudflare/workers-types").D1Database;
		MEDIA: import("@cloudflare/workers-types").R2Bucket;
	};
	export function waitUntil(promise: Promise<unknown>): void;
}
