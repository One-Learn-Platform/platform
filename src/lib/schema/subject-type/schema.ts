import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { subjectType } from "$lib/schema/db";

export const formSchema = createInsertSchema(subjectType, {
	name: z.string().min(1, { error: "Subject type name is required" }),
}).omit({ id: true });

export type FormSchema = z.infer<typeof formSchema>;
