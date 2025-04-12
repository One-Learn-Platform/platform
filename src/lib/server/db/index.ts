import { drizzle } from "drizzle-orm/d1";
import type { RequestEvent } from "@sveltejs/kit";

export function getDb(Event: RequestEvent) {
	return drizzle(Event.locals.DB);
}
