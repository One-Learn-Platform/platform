<script lang="ts">
	import type { PageServerData } from "./$types";

	import Subject from "$lib/components/subject.svelte";
	import { Input } from "$lib/components/ui/input/index.js";

	let { data }: { data: PageServerData } = $props();

	let searchQuery = $state("");
	const filteredSubjects = $derived(
		data.subjectList?.filter(
			(subject) =>
				subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				subject.code.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);
</script>

<svelte:head>
	<title>Subjects | OneLearn</title>
</svelte:head>

<Input
	type="search"
	placeholder="Search subjects by code or name"
	bind:value={searchQuery}
	class="mb-4 w-full max-w-sm"
/>
{#if filteredSubjects && filteredSubjects.length > 0}
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredSubjects as subject (subject.id)}
			<Subject {subject} />
		{/each}
	</div>
{:else}
	<div class="flex grow items-center justify-center text-center">
		<p class="font-display text-2xl font-medium tracking-tight text-muted-foreground">
			No subjects found.
		</p>
	</div>
{/if}
