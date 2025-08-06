import { classroom } from "$lib/schema/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const formSchema = createInsertSchema(classroom, {
	name: z
		.string()
		.min(1, { error: "Name can't be empty" })
		.max(255, { error: "Name can't be longer than 255 characters" }),
}).omit({
	id: true,
	schoolId: true,
});

export const formSchemaEdit = formSchema.partial();

export type FormSchemaCreate = z.infer<typeof formSchema>;
export type FormSchemaEdit = z.infer<typeof formSchemaEdit>;
