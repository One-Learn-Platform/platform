<script lang="ts">
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import type { PageServerData } from "./$types";

	import dayjs from "dayjs";

	import { Input } from "$lib/components/ui/input/index.js";

	import Announcement from "$lib/components/cards/announcement.svelte";

	const { data }: { data: PageServerData } = $props();
	let search = $state("");
	const filteredAnnouncements = $derived(
		data.announcements
			.filter(
				(announcement) =>
					dayjs(announcement.startDate).isBefore(dayjs()) &&
					dayjs(announcement.endDate).isAfter(dayjs()),
			)
			.filter(
				(announcement) =>
					announcement.title.toLowerCase().includes(search.toLowerCase()) ||
					announcement.content.toLowerCase().includes(search.toLowerCase()),
			),
	);
</script>

<h1 class="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
	Announcements
</h1>
<Input
	type="search"
	bind:value={search}
	id="search"
	class="max-w-sm"
	placeholder="Search announcements..."
/>
{#if filteredAnnouncements.length > 0}
	{#each filteredAnnouncements as announcement (announcement.id)}
		<div
			transition:fade={{ duration: 200, easing: cubicOut }}
			animate:flip={{ duration: 200, easing: cubicOut }}
		>
			<Announcement {announcement} />
		</div>
	{/each}
{:else}
	<p class="self-center text-center text-muted-foreground">No announcements at this time.</p>
{/if}
