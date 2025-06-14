import type { User } from "$lib/schema/db";

type UserWithoutPassword = Omit<User, "password">;
type GroupedUser = {
	period: string;
	count: number;
	users: UserWithoutPassword[];
	teacher: number;
	student: number;
	admin: number;
	super_admin: number;
};
type Period = "day" | "month" | "year";

// Role mapping
const roleMap: Record<
	number,
	keyof Pick<GroupedUser, "teacher" | "student" | "admin" | "super_admin">
> = {
	1: "super_admin",
	2: "admin",
	3: "teacher",
	4: "student",
};

export function groupUsers(users: UserWithoutPassword[], period: Period): GroupedUser[] {
	const grouped = users.reduce(
		(acc, user) => {
			let periodKey: string;
			switch (period) {
				case "day":
					periodKey = user.createdAt.substring(0, 10); // "2025-01-15"
					break;
				case "month":
					periodKey = user.createdAt.substring(0, 7); // "2025-01"
					break;
				case "year":
					periodKey = user.createdAt.substring(0, 4); // "2025"
					break;
				default:
					throw new Error("Invalid period");
			}

			if (!acc[periodKey]) {
				acc[periodKey] = {
					period: periodKey,
					count: 0,
					users: [],
					teacher: 0,
					student: 0,
					admin: 0,
					super_admin: 0,
				};
			}

			// Increment total count
			acc[periodKey].count++;
			acc[periodKey].users.push(user);

			// Increment role-specific count
			const roleKey = roleMap[user.roleId];
			if (roleKey) {
				acc[periodKey][roleKey]++;
			}

			return acc;
		},
		{} as Record<string, GroupedUser>,
	);

	return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}
