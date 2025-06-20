<script lang="ts">
	import type { Forum } from "$lib/schema/db";
	import { page } from "$app/state";
	import { flip } from "svelte/animate";
	import { expoOut } from "svelte/easing";

	import Plus from "@lucide/svelte/icons/plus";
	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";

	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import ForumChild from "$lib/components/cards/forum.svelte";

	let {
		forumList,
	}: { forumList: (Forum & { fullname: string; avatar: string | null; subjectCode: string })[] } =
		$props();
	let sortBy = $state("date");
	let sortOpt = $state("asc");

	const sortedData = $derived.by(() =>
		forumList?.toSorted((a, b) => {
			if (sortBy === "date") {
				if (sortOpt === "asc") {
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				}
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			} else if (sortBy === "name") {
				if (sortOpt === "asc") {
					return a.fullname?.localeCompare(b.fullname ?? "") || 0;
				}
				return b.fullname?.localeCompare(a.fullname ?? "") || 0;
			}
			return 0;
		}),
	);
</script>

<div>
	<h2 class="font-display text-2xl font-semibold">Forum</h2>
	<Separator />
</div>
<div class="flex justify-between">
	<Button variant="secondary" href={`${page.url.pathname}/forum/create`}><Plus />New Post</Button>
	<div class="flex flex-row gap-2">
		<Button variant="secondary" onclick={() => (sortOpt = sortOpt === "asc" ? "desc" : "asc")}>
			{#if sortOpt === "asc"}
				<ArrowDown />Descending
			{:else}
				<ArrowUp />Ascending
			{/if}
		</Button>
		<Select.Root bind:value={sortBy} type="single" onValueChange={(value) => (sortBy = value)}>
			<Select.Trigger>Sort By</Select.Trigger>
			<Select.Content>
				<Select.Item value="date">Date</Select.Item>
				<Select.Item value="name">Name</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
</div>
<div class="mt-4 flex flex-col gap-4">
	{#each sortedData as forum (forum.id)}
		<div animate:flip={{ duration: 200, easing: expoOut }}>
			<ForumChild {forum} />
		</div>
	{/each}
</div>
