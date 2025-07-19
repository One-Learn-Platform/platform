import { grades } from "$lib/schema/db";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const formSchema = createInsertSchema(grades, {
	level: z.number(),
}).omit({
	id: true,
	schoolId: true,
});

export type CreateMaterialSchema = typeof formSchema;
