<script lang="ts" generics="TData extends RowData">
	import {
		createTable,
		dataTableFeatures,
		FlexRender,
		type DataTableColumnDef,
	} from "$lib/components/ui/data-table/index.js";
	import type { RowData } from "@tanstack/svelte-table";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	type DataTableProps<TData extends RowData> = {
		columns: DataTableColumnDef<TData>[];
		data: TData[];
	};

	let { columns, data }: DataTableProps<TData> = $props();

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

<div>
	<div class="flex items-center py-4">
		<Input
			type="search"
			placeholder="Search"
			onchange={(e) => table.setGlobalFilter(String(e.currentTarget.value))}
			oninput={(e) => table.setGlobalFilter(String(e.currentTarget.value))}
			class=""
		/>
	</div>
	{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
		<input type="hidden" name="selected-multiple" value={row.getValue("id")} />
	{/each}
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan}>
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
</div>
