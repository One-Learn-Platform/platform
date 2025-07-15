import { z } from "zod";
import { comment } from "$lib/schema/db";
import { createInsertSchema } from "drizzle-zod";

export const formSchema = createInsertSchema(comment, {
	content: z.string().min(1, "Content is required"),
}).omit({
	userId: true,
	forumId: true,
	id: true,
	createdAt: true,
	schoolId: true,
});
