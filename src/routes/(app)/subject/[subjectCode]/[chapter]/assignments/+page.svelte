<script lang="ts">
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import type { PageServerData } from "./$types";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";

	import Assignment from "$lib/components/cards/assignment.svelte";
	let { data }: { data: PageServerData } = $props();
	let searchQuery = $state("");
	let hideDone = $state(false);
	let sortBy = $state("createdAt");
	let sortOpt = $state("desc");
	const sortChoice = [
		{ label: "Created At", value: "createdAt" },
		{ label: "Title", value: "title" },
	];
	const selectedSort = $derived(sortChoice.find((choice) => choice.value === sortBy));
	const assignmentList = $derived(
		hideDone
			? data.assignmentList.filter((assignment) => assignment.done === 0)
			: data.assignmentList,
	);
	const filteredAssignments = $derived.by(() =>
		assignmentList
			.filter((assignment) => assignment.title.toLowerCase().includes(searchQuery.toLowerCase()))
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
</script>

<h1 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Assignments</h1>
<div class="mb-4 flex flex-row items-center justify-between gap-2">
	<div class="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
		<Input type="search" bind:value={searchQuery} placeholder="Search by name" class="max-w-sm" />
		<div class="grid w-full grid-cols-2 flex-row items-center gap-4 self-end sm:flex sm:w-fit">
			<div class="flex place-content-end items-center space-x-2 max-sm:col-span-2">
				<Switch bind:checked={hideDone} id="hide" />
				<Label for="hide">Hide Completed</Label>
			</div>
			<Select.Root type="single" bind:value={sortBy}>
				<Select.Trigger class="w-full">{selectedSort?.label}</Select.Trigger>
				<Select.Content>
					{#each sortChoice as { label, value } (value)}
						<Select.Item {value}>{label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button
				variant="secondary"
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
</div>
{#if filteredAssignments && filteredAssignments.length > 0}
	{#each filteredAssignments as assignment (assignment.id)}
		<div
			transition:fade={{ duration: 150, easing: cubicOut }}
			animate:flip={{ duration: 200, easing: cubicOut }}
			class="w-full"
		>
			<Assignment {assignment} done={assignment.done === 1} />
		</div>
	{/each}
{:else}
	<p class="text-muted-foreground">No assignments available.</p>
{/if}
