<script lang="ts">
	import type { PageParentData, PageServerData } from "./$types";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import SquareArrowOutUpRight from "@lucide/svelte/icons/square-arrow-out-up-right";

	const { data }: { data: PageServerData & PageParentData } = $props();
</script>

<section class="space-y-2">
	<div class="space-y-px">
		<div class="flex items-center justify-between">
			<h1 class="font-display text-3xl font-semibold tracking-tight">{data.announcement.title}</h1>
			{#if data.user.role === 2}
				<Button href="/admin/announcement/{data.announcement.id}" variant="outline">
					<SquareArrowOutUpRight />
					Edit
				</Button>
			{/if}
		</div>
		<Separator />
		<p class="text-sm text-muted-foreground">
			{new Date(data.announcement.startDate + "Z").toLocaleDateString(undefined, {
				dateStyle: "full",
			})}
		</p>
	</div>
	<p>{data.announcement.content}</p>
</section>
