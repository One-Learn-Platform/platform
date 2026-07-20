import { browser } from "$app/environment";
import createDOMPurify from "dompurify";

let purify: ReturnType<typeof createDOMPurify>;

if (browser) {
	purify = createDOMPurify(window);
} else {
	const { parseHTML } = await import("linkedom");
	const { window: fakeWindow } = parseHTML("<!DOCTYPE html><html><body></body></html>");
	purify = createDOMPurify(fakeWindow as unknown as Window & typeof globalThis);
}

export function sanitizeHtml(dirty: string): string {
	return purify.sanitize(dirty);
}
