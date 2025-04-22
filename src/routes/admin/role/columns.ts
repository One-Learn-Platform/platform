import type { UserRole } from "$lib/server/db/schema";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";

import { renderSnippet } from "$lib/components/ui/data-table/index.js";

export const columns: ColumnDef<UserRole>[] = [
	{
		accessorKey: "id",
		header: () => {
			const idSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-center">ID</div>`,
			}));
			return renderSnippet(idSnippet, "");
		},

		cell: ({ row }) => {
			const value = row.getValue("id");
			const amountCellSnippet = createRawSnippet(() => {
				return {
					render: () => `<div class="text-center">${value}</div>`,
				};
			});

			return renderSnippet(amountCellSnippet, value);
		},
	},
	{
		accessorKey: "name",
		header: () => {
			const idSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-center">Name</div>`,
			}));
			return renderSnippet(idSnippet, "");
		},
	},
];
