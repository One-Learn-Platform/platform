import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
	logo: z
		.instanceof(File, { message: "Logo is required" })
		.refine((file) => file.size > 0 && file.size < 5 * 1024 * 1024, {
			message: "Logo must be less than 5MB",
		}),
});

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema.partial({
	logo: true,
});

export type FormSchema = z.infer<typeof formSchemaCreate>;
