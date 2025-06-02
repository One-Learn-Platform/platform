import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
	teacher: z.string().min(1, { message: "Teacher is required" }),
});

export const formSchemaCreate = formSchema;

export const formSchemaEdit = formSchema.partial();

export type FormSchema = z.infer<typeof formSchemaCreate>;
