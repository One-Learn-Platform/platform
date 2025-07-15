<script lang="ts">
	import type { Assignment } from "$lib/schema/db";

	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import BadgeCheck from "@lucide/svelte/icons/badge-check";

	let {
		assignment,
		done = false,
	}: {
		assignment: Assignment & { subject: string; subjectCode: string; subjectType: string };
		done?: boolean;
	} = $props();

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
	const localeDate = $derived(new Date(assignment.dueDate + "Z"));
	const dueDateClass = $derived.by(() => {
		if (dayjs(localeDate).isBefore(dayjs())) {
			return "text-destructive";
		} else if (dayjs(localeDate).isSame(dayjs(), "day")) {
			return "text-warning";
		} else {
			return "text-primary";
		}
	});
</script>

<a
	href="/subject/{assignment.subjectCode}/{assignment.chapter}/assignments/{assignment.id}"
	class="flex h-fit flex-col gap-2 overflow-hidden rounded-sm border bg-background p-4 duration-150 hover:bg-accent/90"
>
	<div class="">
		<h2 class="flex items-center gap-2 text-xl font-semibold tracking-tight">
			{assignment.title}
			{#if done}
				<Badge variant="success" class="tracking-normal">
					<BadgeCheck />
					Done
				</Badge>
			{/if}
		</h2>
		<Separator class="w-fit" />
		<p class="max-h-20 max-w-full overflow-clip bg-transparent text-muted-foreground">
			{assignment.description}
		</p>
	</div>
	<div class="flex flex-row items-center gap-2 text-sm">
		<p class="min-w-fit text-sm tracking-tight text-muted-foreground">
			{dateFormatter.format(localeDate)} |
			<span class={["font-medium", dueDateClass]}>
				{dayjs(localeDate).fromNow()}
			</span>
		</p>
	</div>
</a>
