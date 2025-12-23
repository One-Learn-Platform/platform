<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Announcement } from "$lib/schema/db";

	import { Separator } from "$lib/components/ui/separator/index.js";

	let {
		announcement,
	}: {
		announcement: Announcement;
	} = $props();
</script>

<a
	href={resolve(`/announcements/${announcement.id}`)}
	class="flex h-36 flex-col gap-2 overflow-hidden rounded-sm border bg-background p-4 duration-150 hover:bg-accent/90"
>
	<div>
		<h3 class="text-2xl font-semibold tracking-tight">{announcement.title}</h3>
		<Separator />
	</div>
	<p class="grow overflow-hidden text-ellipsis text-muted-foreground">
		{announcement.content}
	</p>
	<p class="text-xs text-muted-foreground">
		Started on {new Date(announcement.startDate).toLocaleDateString()}
	</p>
</a>
