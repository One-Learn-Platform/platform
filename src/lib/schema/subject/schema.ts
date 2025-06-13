import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { subject } from "$lib/schema/db";

const formSchema = createInsertSchema(subject, {
	code: z.string().min(1, "Subject code is required"),
	name: z.string().min(1, "Subject name is required"),
	teacher: z.string().min(1, "Teacher is required"),
	subjectType: z.string().min(1, "Subject type is required"),
}).omit({ id: true });

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema;

export type FormSchema = z.infer<typeof formSchemaCreate>;
