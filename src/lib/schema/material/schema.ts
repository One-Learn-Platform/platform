import { material } from "$lib/schema/db";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const formSchema = createInsertSchema(material, {
	title: z.string().min(3, { error: "Title must be at least 3 characters long" }).max(255),
	attachment: z
		.any()
		.optional()
		.refine(
			(files) => {
				if (!files || files.length === 0) return true;
				const fileArray = Array.from(files);
				return fileArray.every((file) => {
					if (!(file instanceof File)) return false;
					if (file.size >= 100_000_000) return false;
					return true;
				});
			},
			{
				message: "Each file must be less than 100MB and be a valid file",
			},
		),
	content: z
		.string()
		.min(1, { error: "Content is required." })
		.max(65535, { error: "Content is too long, please shorten it." }),
	description: z
		.string()
		.min(1, { error: "Description is required." })
		.max(65535, { error: "Description is too long, please shorten it." }),
}).omit({
	id: true,
	schoolId: true,
	createdAt: true,
	chapter: true,
	subjectId: true,
});

export const formSchemaEdit = formSchema.partial();

export type CreateMaterialSchema = typeof formSchema;
