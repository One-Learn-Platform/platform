import { z } from "zod";

// 0,1,2,3
export const Role = z.enum(["super admin", "admin", "teacher", "student"], {
	required_error: "Role is required",
});

export const formSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		dob: z.string().refine((v) => v, { message: "A date of birth is required." }),
		username: z.string().min(1, "Username is required"),
		password: z.string().min(1, "Password is required"),
		role: Role,
		school: z.string().optional(),
	})
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
export type RoleEnum = z.infer<typeof Role>;
