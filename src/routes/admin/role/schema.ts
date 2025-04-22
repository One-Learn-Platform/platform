import { z } from "zod";

export const formSchema = z.object({
	roleName: z.string().min(1, "Role name is required"),
});
