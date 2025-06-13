<script lang="ts">
	import type { PageServerData } from "./$types";

	import Subject from "$lib/components/subject.svelte";

	let { data }: { data: PageServerData } = $props();
</script>

<h1 class="font-display text-3xl font-semibold">Subjects</h1>
<div class="flex flex-col gap-2">
	{#if data.subjectList}
		{#each data.subjectList as subject (subject.id)}
			<Subject {subject} />
		{/each}
	{:else}
		<p>No subjects found.</p>
	{/if}
</div>
