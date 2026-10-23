import { z } from "zod";

export const formSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters long")
		.max(30, "Username can't be more than 30 characters long")
		.regex(
			/^[a-z0-9_.-]+$/i,
			"Username can only contain alphanumeric characters, underscores, and hyphens",
		),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters long")
		.max(255, "Password can't be more than 255 characters long"),
});

export type FormSchema = z.infer<typeof formSchema>;
