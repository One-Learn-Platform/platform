<script lang="ts">
	import { page } from "$app/state";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import type { PageServerData, PageServerParentData } from "./$types.js";

	import type { Assignment } from "$lib/schema/db";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import Plus from "@lucide/svelte/icons/plus";

	import AssignmentComp from "$lib/components/cards/assignment.svelte";
	import FileChartColumnIncreasing from "@lucide/svelte/icons/file-chart-column-increasing";

	type SortKey = keyof Assignment;
	const sortableFields: Partial<Record<SortKey, string>> = {
		createdAt: "Created At",
		title: "Title",
		dueDate: "Due Date",
	};

	let { data }: { data: PageServerData & PageServerParentData } = $props();
	let searchQuery = $state("");
	let hideDone = $state(false);
	let hideMissed = $state(false);
	let sortBy = $state<SortKey>("createdAt");
	let sortOpt = $state("desc");
	const sortChoice = Object.entries(sortableFields).map(([key, label]) => ({
		label: label!,
		value: key as SortKey,
	}));

	const selectedSort = $derived(sortChoice.find((choice) => choice.value === sortBy));
	const assignmentList = $derived.by(() => {
		if (hideDone && hideMissed) {
			return data.assignments.filter(
				(assignment) => assignment.done === 0 && assignment.missed === 0,
			);
		} else if (hideDone) {
			return data.assignments.filter((assignment) => assignment.done === 0);
		} else if (hideMissed) {
			return data.assignments.filter((assignment) => assignment.missed === 0);
		}
		return data.assignments;
	});
	const filteredAssignments = $derived.by(() =>
		assignmentList
			.filter((assignment) => assignment.title.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => {
				const aValue = a[sortBy];
				const bValue = b[sortBy];

				if (aValue == null && bValue == null) return 0;
				if (aValue == null) return sortOpt === "asc" ? 1 : -1;
				if (bValue == null) return sortOpt === "asc" ? -1 : 1;

				const aStr = String(aValue).toLowerCase();
				const bStr = String(bValue).toLowerCase();

				if (sortOpt === "asc") {
					return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
				} else {
					return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
				}
			}),
	);
</script>

<svelte:head>
	<title>{data.subject.name} | One Learn</title>
	<meta name="description" content={`Subject page for ${data.subject.name}.`} />
</svelte:head>

<div class="mb-4 space-y-1">
	<h1 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Assignments</h1>
	{#if data.user.role === 3}
		<div class="flex w-full gap-2 *:grow *:basis-0">
			<Button variant="default" href="/subject/{page.params.subjectCode}/1/assignments/create">
				<Plus />Add Assignment
			</Button>
			<Button variant="outline" href="/subject/{page.params.subjectCode}/1/assignments/results">
				<FileChartColumnIncreasing />Results
			</Button>
		</div>
	{/if}
</div>
<div class="mb-4 flex flex-row items-center justify-between gap-2">
	<div class="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
		<Input type="search" bind:value={searchQuery} placeholder="Search by name" class="max-w-sm" />
		<div class="grid w-full grid-cols-2 flex-row items-center gap-4 self-end sm:flex sm:w-fit">
			<div class="flex place-content-end items-center space-x-2 max-sm:place-self-start">
				<Switch bind:checked={hideDone} id="hide" />
				<Label for="hide">Hide Completed</Label>
			</div>
			<div class="flex place-content-end items-center space-x-2">
				<Switch bind:checked={hideMissed} id="hide-missed" />
				<Label for="hide-missed">Hide Missed</Label>
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
{#if filteredAssignments.length !== 0}
	{#each filteredAssignments as assignment (assignment.id)}
		<div
			animate:flip={{ duration: 300, easing: cubicOut }}
			transition:fade={{ easing: cubicOut, duration: 200 }}
			class="mb-4"
		>
			<AssignmentComp {assignment} done={assignment.done === 1} />
		</div>
	{/each}
{:else}
	<div class="text-center text-muted-foreground">No assignments available for this chapter.</div>
{/if}
