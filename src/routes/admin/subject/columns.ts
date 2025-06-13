import type { Subject } from "$lib/schema/db";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";

import { renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "$lib/components/table/data-table-actions.svelte";

import sortable from "$lib/components/table/sortable-header.svelte";
import Checkbox from "$lib/components/table/data-table-checkbox.svelte";

type SubjectWithTeacher = Subject & {
	teacherName: string | null;
	subjectTypeName: string | null;
};
export const columns: ColumnDef<SubjectWithTeacher>[] = [
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
		accessorKey: "code",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Code",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const value = row.getValue("code");
			const codeCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-left font-mono">${value}</div>`,
				};
			});
			return renderSnippet(codeCellSnippet, value);
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Name",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
	},
	{
		accessorKey: "subjectTypeName",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Subject Type",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
		cell: ({ row }) => {
			const value = row.getValue("subjectTypeName");
			const typeCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="">${value}</div>`,
				};
			});
			return renderSnippet(typeCellSnippet, value);
		},
	},
	{
		accessorKey: "teacherName",
		header: ({ column }) =>
			renderComponent(sortable, {
				name: "Teacher Name",
				sort: column.getIsSorted(),
				onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			}),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				name: row.original.name,
				href: "subject",
			});
		},
	},
];
