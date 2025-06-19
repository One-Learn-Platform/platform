<script lang="ts">
	import type { PageServerData } from "./$types";

	const { data }: { data: PageServerData } = $props();
</script>

{#if data.announcements.length > 0}
	<ul class="">
		{#each data.announcements as announcement (announcement.id)}
			<li class="mb-2 space-y-1 rounded-sm border p-2">
				<h3 class="text-2xl font-semibold tracking-tight">{announcement.title}</h3>
				<p class="text-muted-foreground">{announcement.content}</p>
				<p class="text-xs text-muted-foreground">
					Started on {new Date(announcement.startDate).toLocaleDateString()}
				</p>
			</li>
		{/each}
	</ul>
{:else}
	<p class="self-center text-center text-muted-foreground">No announcements at this time.</p>
{/if}
