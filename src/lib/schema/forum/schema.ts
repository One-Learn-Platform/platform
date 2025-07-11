import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { forum } from "$lib/schema/db";

const formSchema = createInsertSchema(forum, {
	title: z.string().min(1, { error: "Forum title is required" }),
	description: z.string().min(1, { error: "Forum description is required" }),
	attachment: z.string().optional(),
}).omit({
	id: true,
	createdAt: true,
	schoolId: true,
	subjectId: true,
	chapter: true,
	userId: true,
});

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema.partial();

export type FormSchema = z.infer<typeof formSchemaCreate>;
