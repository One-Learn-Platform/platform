import type { RequestEvent } from "@sveltejs/kit";

export function getR2(event: RequestEvent) {
	return event.locals.R2;
}
