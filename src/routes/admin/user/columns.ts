import type { User } from "$lib/server/db/schema";
import type { ColumnDef } from "@tanstack/table-core";

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		id: "avatar",
		header: "Avatar",
	},
	{
		id: "school",
		header: "School",
	},
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "grades",
		header: "Grades",
	},
	{
		accessorKey: "username",
		header: "Username",
	},
	{
		id: "createdAt",
		header: "Created At",
	},
];
