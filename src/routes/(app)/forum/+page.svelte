<script lang="ts">
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import type { PageServerData } from "./$types";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";

	import Forum from "$lib/components/cards/forum.svelte";

	const { data }: { data: PageServerData } = $props();
	let searchQuery = $state("");

	const sortChoice = [
		{ label: "Created At", value: "createdAt" },
		{ label: "Title", value: "title" },
		{ label: "Author", value: "fullname" },
	];
	let sortBy = $state("createdAt");
	let sortOpt = $state("desc");
	const filteredForums = $derived.by(() =>
		data.forums
			.filter((forum) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					forum.title.toLowerCase().includes(searchLower) ||
					forum.fullname?.toLowerCase().includes(searchLower)
				);
			})
			.sort((a, b) => {
				const aValue = a[sortBy];
				const bValue = b[sortBy];
				if (sortOpt === "asc") {
					return aValue > bValue ? 1 : -1;
				} else {
					return aValue < bValue ? 1 : -1;
				}
			}),
	);
	const selectedSort = $derived(sortChoice.find((choice) => choice.value === sortBy));
</script>

<h1 class="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
	Forum
</h1>
<div class="mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
	<Input type="search" bind:value={searchQuery} placeholder="Search by name" class="max-w-sm" />
	<div class="flex items-center gap-2 self-end max-sm:w-full">
		<Select.Root type="single" bind:value={sortBy}>
			<Select.Trigger class="grow sm:grow-0">{selectedSort?.label}</Select.Trigger>
			<Select.Content>
				{#each sortChoice as { label, value } (value)}
					<Select.Item {value}>{label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Button
			variant="secondary"
			class="grow sm:grow-0"
			onclick={() => {
				sortOpt = sortOpt === "asc" ? "desc" : "asc";
			}}
		>
			{#if sortOpt === "asc"}
				<ArrowUp /> <span>Ascending</span>
			{:else}
				<ArrowDown /> <span>Descending</span>
			{/if}
		</Button>
	</div>
</div>
{#if filteredForums && filteredForums.length > 0}
	<div class="flex flex-col gap-2">
		{#each filteredForums as forum (forum.id)}
			<div animate:flip={{ duration: 150, easing: cubicOut }} transition:fade={{ duration: 150 }}>
				<Forum {forum} />
			</div>
		{/each}
	</div>
{:else}
	<p class="text-muted-foreground">No forums available.</p>
{/if}
