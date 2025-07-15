import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { user } from "$lib/schema/db";

// 0,1,2,3
export const Role = z.enum(["super admin", "admin", "teacher", "student"], {
	error: "Role is required",
});

export const formSchema = createInsertSchema(user, {
	fullname: z.string().min(1, { error: "Name is required" }),
	avatar: z
		.instanceof(File, { error: "Logo is required" })
		.refine((file) => file.size > 0 && file.size < 5 * 1024 * 1024, {
			error: "Logo must be less than 5MB",
		})
		.optional(),
	dob: z.string().refine((v) => v, { error: "A date of birth is required." }),
	username: z.string().min(1, { error: "Username is required" }),
	password: z
		.string()
		.min(6, {
			error: "Invalid password (min 6, max 255 characters, must contain letters and numbers)",
		})
		.max(255, {
			error: "Invalid password (min 6, max 255 characters, must contain letters and numbers)",
		}),
	roleId: Role,
	schoolId: z.string().optional(),
}).omit({
	id: true,
	createdAt: true,
});

export const formSchemaWithPass = formSchema
	.refine(
		(data) => {
			if (
				data.roleId === Role.enum["super admin"] &&
				data.schoolId !== undefined &&
				data.schoolId !== ""
			) {
				return false;
			}
			return true;
		},
		{
			error: "Super Admin is not allowed to have a school",
			path: ["schoolId"],
		},
	)
	.refine(
		(data) => {
			if (
				data.roleId !== Role.enum["super admin"] &&
				(data.schoolId === undefined || data.schoolId === "")
			) {
				return false;
			}
			return true;
		},
		{
			error: "School is required for non-super admin roles",
			path: ["schoolId"],
		},
	);

export const formSchemaUploadImage = formSchema.pick({ avatar: true }).extend({
	avatar: z
		.instanceof(File, {
			error: "Please upload a valid image file",
		})
		.refine((file) => file.size > 0 && file.size < 5 * 1024 * 1024, {
			error: "Logo must be less than 5MB",
		}),
});

export const formSchemaWithoutPass = formSchema.omit({
	password: true,
	roleId: true,
	schoolId: true,
	gradesId: true,
});

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
		error: "Passwords do not match",
		path: ["passwordConfirm"],
	});

export type FormSchema = z.infer<typeof formSchema>;
export type FormSchemaUploadImage = z.infer<typeof formSchemaUploadImage>;
export type FormSchemaWithPass = z.infer<typeof formSchemaWithPass>;
export type FormSchemaWithoutPass = z.infer<typeof formSchemaWithoutPass>;
export type FormSchemaPassOnly = z.infer<typeof formSchemaPassOnly>;
export type RoleEnum = z.infer<typeof Role>;
