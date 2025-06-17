import type { Forum } from "$lib/schema/db";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";

import { renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "$lib/components/table/data-table-actions.svelte";

import sortable from "$lib/components/table/sortable-header.svelte";
import Checkbox from "$lib/components/table/data-table-checkbox.svelte";

type ForumWithUser = Forum & {
	user: string | null;
	material: string | null;
};
export const columns: ColumnDef<ForumWithUser>[] = [
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
		accessorKey: "subjectId",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Subject",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const value = row.getValue("subjectId");
			const codeCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-left font-mono">${value}</div>`,
				};
			});
			return renderSnippet(codeCellSnippet, value);
		},
	},
	{
		accessorKey: "user",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "User",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const value = row.getValue("user");
			const userCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-left font-mono">${value || "N/A"}</div>`,
				};
			});
			return renderSnippet(userCellSnippet, value);
		},
	},
	{
		accessorKey: "title",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Name",
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
			const value = row.getValue("createdAt");
			const createdAtCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-left font-mono">${value || "N/A"}</div>`,
				};
			});
			return renderSnippet(createdAtCellSnippet, value);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				name: row.original.title,
				href: "forum",
			});
		},
	},
];
