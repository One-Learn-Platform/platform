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
	password: z
		.string()
		.min(6, "Invalid password (min 6, max 255 characters, must contain letters and numbers)")
		.max(255, "Invalid password (min 6, max 255 characters, must contain letters and numbers)"),
	role: Role,
	school: z.string().optional(),
});

export const formSchemaWithPass = formSchema
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

export const formSchemaWithoutPass = formSchema
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

export const formSchemaPassOnly = formSchema
	.pick({
		password: true,
	})
	.extend({
		passwordOld: z
			.string()
			.min(6, "Invalid password (min 6, max 255 characters, must contain letters and numbers)")
			.max(255, "Invalid password (min 6, max 255 characters, must contain letters and numbers)"),
		passwordConfirm: z
			.string()
			.min(6, "Invalid password (min 6, max 255 characters, must contain letters and numbers)")
			.max(255, "Invalid password (min 6, max 255 characters, must contain letters and numbers)"),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Passwords do not match",
		path: ["passwordConfirm"],
	});

export type FormSchema = z.infer<typeof formSchema>;
export type FormSchemaUploadImage = z.infer<typeof formSchemaUploadImage>;
export type FormSchemaCreate = z.infer<typeof formSchemaWithPass>;
export type FormSchemaEdit = z.infer<typeof formSchemaWithoutPass>;
export type FormSchemaPassOnly = z.infer<typeof formSchemaPassOnly>;
export type RoleEnum = z.infer<typeof Role>;
