import { z } from "zod";
import { comment } from "$lib/schema/db";
import { createInsertSchema } from "drizzle-zod";

export const formSchema = createInsertSchema(comment, {
	content: z.string().min(1, "Content is required"),
}).omit({
	userId: true,
	forumId: true,
	createdAt: true,
	schoolId: true,
});

export const formSchemaCreate = formSchema.omit({ id: true });

export const formSchemaEdit = formSchema.partial();

export type FormSchema = z.infer<typeof formSchemaCreate>;
export type FormSchemaEdit = z.infer<typeof formSchemaEdit>;
