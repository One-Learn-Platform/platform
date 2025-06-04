import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { userRole } from "$lib/schema/db";

export const formSchema = createInsertSchema(userRole, {
	name: z.string().min(1, "Role name is required"),
}).omit({ id: true });

export type FormSchema = z.infer<typeof formSchema>;
