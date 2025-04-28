<script lang="ts">
	import type { ComponentProps } from "svelte";
	import type { SortDirection } from "@tanstack/table-core";

	import { cn } from "$lib/utils.js";

	import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import { Button } from "$lib/components/ui/button/index.js";

	let {
		name,
		sort,
		center = false,
		variant = "ghost",
		class: className,
		...restProps
	}: { name: string; sort: false | SortDirection; center?: boolean } & ComponentProps<
		typeof Button
	> = $props();
</script>

<div class={["-ml-2 w-fit", center ? "text-center" : "text-left"]}>
	<Button {variant} size="xs" class={cn("", className)} {...restProps}>
		{name}
		{#if sort === "asc"}
			<ArrowUp class="ml-2" />
		{:else if sort === "desc"}
			<ArrowDown class="ml-2" />
		{:else}
			<ArrowUpDown class="ml-2" />
		{/if}
	</Button>
</div>
