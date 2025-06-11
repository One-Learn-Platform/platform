import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { materialType } from "$lib/schema/db";

export const formSchema = createInsertSchema(materialType, {
	name: z.string().min(1, "Material name is required"),
}).omit({ id: true });

export type FormSchema = z.infer<typeof formSchema>;
