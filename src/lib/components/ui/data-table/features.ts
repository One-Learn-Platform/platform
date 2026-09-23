import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_includesString,
	globalFilteringFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	type CellData,
	type ColumnDef,
	type RowData,
} from "@tanstack/svelte-table";

/**
 * Shared TanStack Table v9 feature set used by every data table in the app.
 * Defined once at module scope so the reference stays stable across renders.
 */
export const dataTableFeatures = tableFeatures({
	columnVisibilityFeature,
	rowSelectionFeature,
	rowSortingFeature,
	columnFilteringFeature,
	globalFilteringFeature,
	sortedRowModel: createSortedRowModel(),
	filteredRowModel: createFilteredRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
	filterFns: {
		includesString: filterFn_includesString,
	},
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumnDef<
	TData extends RowData,
	TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>;
