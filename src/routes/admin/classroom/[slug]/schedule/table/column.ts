import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "./enrollment-table-action.svelte";

import SortableHeader from "$lib/components/table/sortable-header.svelte";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";

import type { Subject } from "$lib/schema/db";
type SubjectWithGrade = Subject & {
	gradeLevel: number;
};
export const columns: ColumnDef<SubjectWithGrade>[] = [
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
		header: "ID",
	},
	{
		accessorKey: "name",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: "Subject Name",
				sort: column.getIsSorted(),
				onclick: column.getToggleSortingHandler(),
			}),
	},
	{
		accessorKey: "code",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: "Subject Code",
				sort: column.getIsSorted(),
				onclick: column.getToggleSortingHandler(),
			}),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				name: row.original.name,
			});
		},
	},
];
