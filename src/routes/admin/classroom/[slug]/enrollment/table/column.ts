import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "./enrollment-table-action.svelte";

import SortableHeader from "$lib/components/table/sortable-header.svelte";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";

import type { User } from "$lib/schema/db";
type StudentWithGrades = Omit<User, "password"> & {
	grades: number | null;
};
export const columns: ColumnDef<StudentWithGrades>[] = [
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
		accessorKey: "fullname",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: "Full Name",
				sort: column.getIsSorted(),
				onclick: column.getToggleSortingHandler(),
			}),
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
