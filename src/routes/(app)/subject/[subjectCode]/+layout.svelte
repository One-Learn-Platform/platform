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
	const urlException = new Set([`/subject/${data.params}/people`]);
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
			<Button
				variant="ghost"
				href="/subject/{page.params.subjectCode}"
				class="h-auto font-display text-4xl font-bold sm:text-5xl md:text-6xl"
			>
				{data.subject.name}
			</Button>
			<Badge class="mt-0.5 text-xs" variant={subjectColor(data.subject.subjectTypeName, true)}>
				{data.subject.subjectTypeName}
			</Badge>
		</div>
	</div>
	<div
		class="flex flex-row gap-2 border p-2
    {urlException.has(page.url.pathname) ? ' rounded-b-xl' : ''}"
	>
		<Button
			variant="outline"
			href="/subject/{page.params.subjectCode}/materials"
			class="min-w-fit grow basis-0"
		>
			<BookOpenText /><span class="max-sm:sr-only">Materials</span>
		</Button>
		<Button
			variant="outline"
			href="/subject/{page.params.subjectCode}/assignments"
			class="min-w-fit grow basis-0"
		>
			<ClipboardList /><span class="max-sm:sr-only">Assignments</span>
		</Button>
		<Button
			variant="outline"
			href="/subject/{page.params.subjectCode}/forum"
			class="min-w-fit grow basis-0"
		>
			<MessagesSquare /><span class="max-sm:sr-only">Forum</span>
		</Button>
		<Button
			variant="secondary"
			href="/subject/{page.params.subjectCode}/people"
			class="min-w-fit grow basis-0"
		>
			<Users /><span class="max-sm:sr-only">People</span>
		</Button>
	</div>
	{#if !urlException.has(page.url.pathname)}
		<div class="mb-2 overflow-x-hidden overflow-y-hidden rounded-b-xl border">
			<div class="flex w-full flex-row gap-2 overflow-x-auto overflow-y-auto p-2">
				{#each Array.from({ length: data.subject.chapterCount }, (_, i) => i + 1) as i (i)}
					{@const getChapterUrl = (chapterNum) => {
						const pathSegments = page.url.pathname.split("/");
						if (pathSegments.length >= 4) {
							if (pathSegments.length > 4 && /^\d+$/.test(pathSegments[pathSegments.length - 1])) {
								pathSegments.pop();
							}
							pathSegments[3] = chapterNum.toString();
							return pathSegments.join("/");
						}
						return `/subject/${page.params.subjectCode}/${chapterNum}`;
					}}
					{@const href = getChapterUrl(i)}
					<Button
						variant={page.url.pathname.startsWith(`/subject/${page.params.subjectCode}/${i}`)
							? "default"
							: "outline"}
						size="sm"
						{href}
						class="w-8 font-display text-sm tracking-tight sm:w-10"
					>
						{i}
					</Button>
				{/each}
			</div>
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
	:global(.raw em) {
		@apply italic;
	}
	:global(.raw pre) {
		@apply overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800;
	}
	:global(.raw code) {
		@apply rounded bg-gray-200 p-1 dark:bg-gray-700;
	}
	:global(.raw b, .raw strong) {
		@apply font-semibold;
	}
	:global(.raw blockquote) {
		@apply border-l-4 pl-2 text-gray-600 italic dark:text-gray-400;
	}
	:global(.raw a) {
		@apply text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300;
	}
</style>
