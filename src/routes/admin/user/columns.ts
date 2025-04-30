import type { User } from "$lib/server/db/schema";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";

import { renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "$lib/components/table/data-table-actions.svelte";

import sortable from "$lib/components/table/sortable-header.svelte";
import Checkbox from "$lib/components/table/data-table-checkbox.svelte";

export const columns: ColumnDef<User>[] = [
	{
		id: "select",
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				"aria-label": "Select all",
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				"aria-label": "Select row",
			}),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "id",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "ID",
				center: true,
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const value = row.getValue("id");
			const amountCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-left font-mono">${value}</div>`,
				};
			});
			return renderSnippet(amountCellSnippet, value);
		},
	},
	{
		accessorKey: "avatar",
		header: "Avatar",
	},
	{
		accessorKey: "fullname",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Name",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
	},
	{
		accessorKey: "username",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Username",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
	},
	{
		accessorKey: "roleId",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Role",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const value = row.getValue("roleId");
			let roleName = "";
			switch (value) {
				case 1:
					roleName = "Super Admin";
					break;
				case 2:
					roleName = "Admin";
					break;
				case 3:
					roleName = "Teacher";
					break;
				case 4:
					roleName = "Student";
					break;
				default:
					roleName = "Unknown";
					break;
			}
			const amountCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="">${roleName}</div>`,
				};
			});
			return renderSnippet(amountCellSnippet, value);
		},
	},
	{
		accessorKey: "gradesId",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Grades Id",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
	},
	{
		accessorKey: "schoolId",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "School Id",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Created At",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return date.toLocaleString();
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				name: row.original.fullname,
			});
		},
	},
];
