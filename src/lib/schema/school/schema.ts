import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { school } from "$lib/schema/db";

const formSchema = createInsertSchema(school, {
	name: z.string().min(3, { error: "Name must be at least 3 characters long" }),
	logo: z
		.instanceof(File, { error: "Logo is required" })
		.refine((file) => file.size > 0 && file.size < 5 * 1024 * 1024, {
			error: "Logo must be less than 5MB",
		}),
}).omit({ id: true });

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema.partial({
	logo: true,
});

export type FormSchema = z.infer<typeof formSchemaCreate>;
