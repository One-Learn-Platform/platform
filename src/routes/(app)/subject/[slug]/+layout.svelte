<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LayoutServerData } from "./$types.js";
	import { page } from "$app/state";

	import ChevronLeft from "@lucide/svelte/icons/chevron-left";

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import { subjectColor } from "$lib/functions/subject";

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
</script>

<svelte:head>
	<title>{data.subject.name} | One Learn</title>
	<meta name="description" content={`Subject page for ${data.subject.name}.`} />
</svelte:head>

<div class="-mb-px flex items-center gap-2 border px-3 py-2">
	<Button variant="ghost" size="icon" onclick={() => window.history.back()}><ChevronLeft /></Button>
	<div class="flex flex-row items-center gap-2">
		<h1 class="font-display text-6xl font-bold">
			{data.subject.name}
		</h1>
		<Badge class="mt-0.5" variant={subjectColor(data.subject.subjectTypeName, true)}>
			{data.subject.subjectTypeName}
		</Badge>
	</div>
</div>
<div class="flex w-full flex-row gap-2 overflow-x-auto border p-2">
	{#each Array.from({ length: data.subject.chapterCount }, (_, i) => i + 1) as i (i)}
		<Button
			variant={page.url.pathname.startsWith(`/subject/${data.params}/${i}`) ? "default" : "outline"}
			size="sm"
			href="/subject/{data.params}/{i}"
			class="w-10 font-display tracking-tight"
		>
			{i}
		</Button>
	{/each}
</div>
{@render children()}

<style>
	@reference "tailwindcss";
	:global(.raw h1) {
		@apply text-3xl font-semibold tracking-tight;
	}
	:global(.raw h2) {
		@apply text-2xl font-semibold tracking-tight;
	}
	:global(.raw h3) {
		@apply text-xl font-semibold tracking-tight;
	}
	:global(.raw h4) {
		@apply text-lg font-semibold tracking-tight;
	}
	:global(.raw p) {
		@apply text-base break-all;
	}
</style>
