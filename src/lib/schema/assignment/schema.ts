import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";
import { assignment } from "$lib/schema/db";

export const formSchema = createInsertSchema(assignment, {
	title: z.string().min(3, { error: "Title must be at least 3 characters long" }).max(255),
	attachment: z
		.instanceof(File, { error: "Please upload a valid file." })
		.refine((f) => f.size < 100_000_000, { error: "File size must be less than 100MB." })
		.array(),
	description: z
		.string()
		.min(1, { error: "Description is required." })
		.max(65535, { error: "Description is too long, please shorten it." }),
	dueDate: z.string().refine((v) => v, { error: "Due date is required." }),
}).omit({
	id: true,
	schoolId: true,
	subjectId: true,
	chapter: true,
	createdAt: true,
});

export const formSchemaEdit = formSchema.partial();
