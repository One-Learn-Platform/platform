import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
	return redirect(302, "https://github.com/One-Learn-Platform/platform");
};
