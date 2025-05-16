<script lang="ts" generics="TData, TValue">
	import { enhance } from "$app/forms";

	import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import {
		type ColumnDef,
		type RowSelectionState,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		type SortingState,
	} from "@tanstack/table-core";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { data, columns }: DataTableProps<TData, TValue> = $props();

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

	let openDialog = $state(false);
	const selectedId = $derived.by(() =>
		table.getSelectedRowModel().rows.map((row) => row.getValue("id")),
	);
	const selectedName = $derived.by(() =>
		table.getSelectedRowModel().rows.map((row) => row.getValue("fullname")),
	);
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

		<AlertDialog.Root bind:open={openDialog}>
			<AlertDialog.Trigger
				class={buttonVariants({ variant: "destructive", outline: true })}
				disabled={table.getFilteredSelectedRowModel().rows.length === 0}
			>
				Delete Selected
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<form class="contents" action="?/multidelete" method="POST" use:enhance>
					<AlertDialog.Header>
						<AlertDialog.Title>Do you want to delete all selected data?</AlertDialog.Title>
						<AlertDialog.Description>
							<input type="hidden" name="ids" id="ids" value={selectedId} />
							This action is irreversible. Are you sure you want to delete
							<b>{selectedName.join(", ")}</b>?
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
						<AlertDialog.Action type="submit" onclick={() => (openDialog = false)}>
							Delete
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</form>
			</AlertDialog.Content>
		</AlertDialog.Root>
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
