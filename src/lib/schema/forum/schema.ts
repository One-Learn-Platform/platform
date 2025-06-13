import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { forum } from "$lib/schema/db";

const formSchema = createInsertSchema(forum, {
	title: z.string().min(1, "Forum title is required"),
	description: z.string().min(1, "Forum description is required"),
	attachment: z.string().optional(),
}).omit({ id: true });

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema.partial();

export type FormSchema = z.infer<typeof formSchemaCreate>;
