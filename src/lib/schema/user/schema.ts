import { z } from "zod";

// 0,1,2,3
export const Role = z.enum(["super admin", "admin", "teacher", "student"], {
	required_error: "Role is required",
});

export const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	avatar: z
		.instanceof(File, { message: "Logo is required" })
		.refine((file) => file.size > 0 && file.size < 5 * 1024 * 1024, {
			message: "Logo must be less than 5MB",
		})
		.optional(),
	dob: z.string().refine((v) => v, { message: "A date of birth is required." }),
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
	role: Role,
	school: z.string().optional(),
});

export const formSchemaCreate = formSchema
	.refine(
		(data) => {
			if (
				data.role === Role.enum["super admin"] &&
				data.school !== undefined &&
				data.school !== ""
			) {
				return false;
			}
			return true;
		},
		{
			message: "Super Admin is not allowed to have a school",
			path: ["school"],
		},
	)
	.refine(
		(data) => {
			if (
				data.role !== Role.enum["super admin"] &&
				data.school === undefined &&
				data.school === ""
			) {
				return false;
			}
			return true;
		},
		{
			message: "School is required for non-super admin roles",
			path: ["school"],
		},
	);

export const formSchemaUploadImage = formSchema
	.pick({
		avatar: true,
	})
	.required();

export const formSchemaEdit = formSchema
	.omit({ password: true })
	.refine(
		(data) => {
			if (
				data.role === Role.enum["super admin"] &&
				data.school !== undefined &&
				data.school !== ""
			) {
				return false;
			}
			return true;
		},
		{
			message: "Super Admin is not allowed to have a school",
			path: ["school"],
		},
	)
	.refine(
		(data) => {
			if (
				data.role !== Role.enum["super admin"] &&
				data.school === undefined &&
				data.school === ""
			) {
				return false;
			}
			return true;
		},
		{
			message: "School is required for non-super admin roles",
			path: ["school"],
		},
	);

export type FormSchema = z.infer<typeof formSchema>;
export type FormSchemaUploadImage = z.infer<typeof formSchemaUploadImage>;
export type FormSchemaCreate = z.infer<typeof formSchemaCreate>;
export type FormSchemaEdit = z.infer<typeof formSchemaEdit>;
export type RoleEnum = z.infer<typeof Role>;
