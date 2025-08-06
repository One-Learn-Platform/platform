import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { subject } from "$lib/schema/db";

const formSchema = createInsertSchema(subject, {
	code: z
		.string()
		.lowercase({ error: "Please use lowercase letters and numbers only." })
		.min(1, { error: "Subject code is required" }),
	name: z.string().min(1, { error: "Subject name is required" }),
	subjectType: z.string().min(1, { error: "Subject type is required" }),
	gradesId: z.number().int(),
	chapterCount: z
		.number()
		.int()
		.min(0, { error: "Chapter count must be a non-negative integer" })
		.max(100, { error: "Chapter count must not exceed 100" }),
}).omit({ id: true });

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema;

export type FormSchema = z.infer<typeof formSchemaCreate>;
export type FormSchemaEdit = z.infer<typeof formSchemaEdit>;
