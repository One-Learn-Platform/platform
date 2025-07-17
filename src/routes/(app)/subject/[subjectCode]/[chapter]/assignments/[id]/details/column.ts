import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import type { PageServerData } from "./$types.js";

import SortableHeader from "$lib/components/table/sortable-header.svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index.js";

import { Badge } from "$lib/components/ui/badge/index.js";

type UserWithSubmission = PageServerData["userList"][0];

export const columns: ColumnDef<UserWithSubmission>[] = [
	{
		accessorKey: "fullname",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: "Name",
				sort: column.getIsSorted(),
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const value = row.getValue("fullname");
			const amountCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="font-medium">${value}</div>`,
				};
			});
			return renderSnippet(amountCellSnippet, value);
		},
	},
	{
		accessorKey: "submissionId",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: "Status",
				sort: column.getIsSorted(),
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const hasSubmitted = row.getValue("submissionId") !== null;
			return renderComponent(Badge, {
				variant: hasSubmitted ? "success_muted" : "destructive_muted",
				children: createRawSnippet(() => ({
					render: () => `<span>${hasSubmitted ? "Submitted" : "Not Submitted"}</span>`,
				})),
			});
		},
	},
	{
		accessorKey: "score",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: "Assignment Score",
				sort: column.getIsSorted(),
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const value = row.getValue("score");
			const amountCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-left font-mono">${value ?? "-"}</div>`,
				};
			});
			return renderSnippet(amountCellSnippet, value);
		},
	},
];
