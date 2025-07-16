<script lang="ts">
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fade, slide } from "svelte/transition";
	import type { PageServerData } from "./$types";

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";

	import Assignment from "$lib/components/cards/assignment.svelte";
	import {
		subjectBgColor,
		subjectColor,
		subjectIcon,
		subjectTextColor,
	} from "$lib/functions/subject";

	const { data }: { data: PageServerData } = $props();
	let hideDone = $state(false);
	let searchQuery = $state("");
	let sortBy = $state("createdAt");
	let sortOpt = $state("desc");
	const sortChoice = [
		{ label: "Created At", value: "createdAt" },
		{ label: "Title", value: "title" },
		{ label: "Subject", value: "subject" },
	];
	const selectedSort = $derived(sortChoice.find((choice) => choice.value === sortBy));
	const filteredAssignments = $derived.by(() =>
		data.assignments
			.filter((assignment) => (hideDone ? assignment.done === 0 : true))
			.filter((assignment) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					assignment.title.toLowerCase().includes(searchLower) ||
					assignment.subject.toLowerCase().includes(searchLower)
				);
			})
			.sort((a, b) => {
				// @ts-expect-error - sortBy is a string, but we know it matches the keys of the assignment object
				const aValue = a[sortBy];
				// @ts-expect-error - sortBy is a string, but we know it matches the keys of the assignment object
				const bValue = b[sortBy];
				if (sortOpt === "asc") {
					return aValue > bValue ? 1 : -1;
				} else {
					return aValue < bValue ? 1 : -1;
				}
			}),
	);
	const groupedAssignments = $derived.by(() => {
		const groupsMap = new Map<string, typeof filteredAssignments>();

		filteredAssignments.forEach((assignment) => {
			const key = JSON.stringify({
				subject: assignment.subject,
				subjectType: assignment.subjectType,
			});
			if (!groupsMap.has(key)) {
				groupsMap.set(key, []);
			}
			groupsMap.get(key)!.push(assignment);
		});
		return Array.from(groupsMap.entries()).map(([key, assignments]) => {
			const { subject, subjectType } = JSON.parse(key);
			return {
				subject,
				subjectType,
				assignments,
			};
		});
	});
</script>

<h1 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
	Assignments
</h1>
<div class="mb-4 flex flex-row items-center justify-between gap-2">
	<div class="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
		<Input type="search" bind:value={searchQuery} placeholder="Search by name" class="max-w-sm" />
		<div
			class="grid w-full grid-cols-2 flex-row items-center gap-2 self-end sm:flex sm:w-fit sm:gap-4"
		>
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
	<div class="flex flex-col gap-2">
		{#each groupedAssignments as group (group.subject + group.subjectType)}
			{@const Icons = subjectIcon(group.subject)}
			<div
				animate:flip={{ duration: 150, easing: cubicOut }}
				transition:slide={{ axis: "x", duration: 150 }}
				class={["space-y-2 rounded-2xl p-4", subjectBgColor(group.subjectType, true)]}
			>
				<div class={["flex flex-row items-center gap-4", subjectTextColor(group.subjectType)]}>
					<Icons class="size-10" />
					<p class="font-display text-2xl font-semibold">{group.subject}</p>
					<Badge variant={subjectColor(group.subjectType)}>{group.subjectType}</Badge>
				</div>
				{#each group.assignments as assignment (assignment.id)}
					<div
						transition:fade={{ duration: 150, easing: cubicOut }}
						animate:flip={{ duration: 150, easing: cubicOut }}
						class="w-full"
					>
						<Assignment {assignment} done={assignment.done === 1} />
					</div>
				{/each}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-muted-foreground">No assignments available.</p>
{/if}
