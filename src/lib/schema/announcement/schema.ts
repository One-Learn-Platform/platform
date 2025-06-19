import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { announcement } from "$lib/schema/db";

export const formSchema = createInsertSchema(announcement, {
	title: z.string().min(1, { error: "Title is required" }),
	content: z.string().min(1, { error: "Content is required" }),
	startDate: z.string().refine((v) => v, { error: "Start date is required" }),
	endDate: z.string().optional(),
	createdAt: z.string().optional(),
}).omit({
	id: true,
	schoolId: true,
});

export type FormSchema = z.infer<typeof formSchema>;
