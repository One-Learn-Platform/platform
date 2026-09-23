<script lang="ts" generics="TData extends RowData">
	import {
		createTable,
		dataTableFeatures,
		FlexRender,
		type DataTableColumnDef,
	} from "$lib/components/ui/data-table/index.js";
	import type { RowData } from "@tanstack/svelte-table";
	import * as Table from "$lib/components/ui/table/index.js";

	import { Input } from "$lib/components/ui/input/index.js";

	type DataTableProps<TData extends RowData> = {
		columns: DataTableColumnDef<TData>[];
		data: TData[];
	};

	let { data, columns }: DataTableProps<TData> = $props();

	const table = createTable({
		features: dataTableFeatures,
		get columns() {
			return columns;
		},
		get data() {
			return data;
		},
		globalFilterFn: "includesString",
	});
</script>

<div class="flex items-center">
	<Input
		type="search"
		placeholder="Search"
		onchange={(e) => table.setGlobalFilter(String(e.currentTarget.value))}
		oninput={(e) => table.setGlobalFilter(String(e.currentTarget.value))}
		class="max-w-sm"
	/>
	<div class="flex w-full items-center justify-end gap-2">
		<div class="text-sm text-muted-foreground">
			{table.getFilteredSelectedRowModel().rows.length} of
			{table.getFilteredRowModel().rows.length} row(s) selected.
		</div>
	</div>
</div>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								<FlexRender {header} />
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && "selected"}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender {cell} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
