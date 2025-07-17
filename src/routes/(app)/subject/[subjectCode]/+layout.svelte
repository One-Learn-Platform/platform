<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { LayoutServerData } from "./$types.js";

	import BookOpenText from "@lucide/svelte/icons/book-open-text";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ClipboardList from "@lucide/svelte/icons/clipboard-list";
	import MessagesSquare from "@lucide/svelte/icons/messages-square";
	import Users from "@lucide/svelte/icons/users";

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import { subjectColor } from "$lib/functions/subject";

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
</script>

<svelte:head>
	<title>{data.subject.name} | One Learn</title>
	<meta name="description" content={`Subject page for ${data.subject.name}.`} />
</svelte:head>

<div class="-space-y-px">
	<div class="flex h-fit items-center gap-2 rounded-t-xl border p-2">
		<Button
			variant="ghost"
			size="default"
			onclick={() => window.history.back()}
			class="h-auto w-auto self-stretch max-sm:hidden"
		>
			<ChevronLeft />
		</Button>
		<div
			class="flex h-fit flex-col-reverse items-start gap-px sm:flex-row sm:items-center sm:gap-1 md:gap-2"
		>
			<div class="font-display text-4xl font-bold sm:text-5xl md:text-6xl">
				{data.subject.name}
			</div>
			<Badge class="mt-0.5 text-xs" variant={subjectColor(data.subject.subjectTypeName, true)}>
				{data.subject.subjectTypeName}
			</Badge>
		</div>
	</div>
	<div class="flex flex-row gap-2 border p-2">
		<Button
			variant="outline"
			href="/subject/{data.params}/materials"
			class="min-w-fit grow basis-0"
		>
			<BookOpenText />Materials
		</Button>
		<Button
			variant="outline"
			href="/subject/{data.params}/assignments"
			class="min-w-fit grow basis-0"
		>
			<ClipboardList />Assignments
		</Button>
		<Button variant="outline" href="/subject/{data.params}/forum" class="min-w-fit grow basis-0">
			<MessagesSquare />Forum
		</Button>
		<Button variant="secondary" href="/subject/{data.params}/people" class="min-w-fit grow basis-0">
			<Users />People
		</Button>
	</div>
	{#if page.url.pathname !== `/subject/${data.params}/people`}
		<div class="mb-2 flex w-full flex-row gap-2 overflow-x-auto rounded-b-xl border p-2">
			{#each Array.from({ length: data.subject.chapterCount }, (_, i) => i + 1) as i (i)}
				<Button
					variant={page.url.pathname.startsWith(`/subject/${data.params}/${i}`)
						? "default"
						: "outline"}
					size="sm"
					href="/subject/{data.params}/{i}"
					class="w-8 font-display text-sm tracking-tight sm:w-10"
				>
					{i}
				</Button>
			{/each}
		</div>
	{/if}
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
