<script lang="ts" generics="TData, TValue">
	import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	import {
		type ColumnDef,
		type RowSelectionState,
		type SortingState,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
	} from "@tanstack/table-core";

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { columns, data }: DataTableProps<TData, TValue> = $props();

	let sorting = $state<SortingState>([]);
	let globalFilter = $state([]);
	let rowSelection = $state<RowSelectionState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: "includesString",
		onSortingChange: (updater) => {
			if (typeof updater === "function") {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},

		onGlobalFilterChange: (updater) => {
			if (typeof updater === "function") {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},

		onRowSelectionChange: (updater) => {
			if (typeof updater === "function") {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get sorting() {
				return sorting;
			},
			get globalFilter() {
				return globalFilter;
			},
			get rowSelection() {
				return rowSelection;
			},
		},
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
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
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
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
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
