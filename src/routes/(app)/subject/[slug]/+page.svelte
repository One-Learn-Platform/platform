<script lang="ts">
	import type { PageServerData } from "./$types";

	import ChevronLeft from "@lucide/svelte/icons/chevron-left";

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";

	import { subjectColor } from "$lib/functions/subject";

	let { data }: { data: PageServerData } = $props();
</script>

<div class="flex items-center gap-2">
	<Button variant="ghost" size="icon" href="/subject"><ChevronLeft /></Button>
	<div class="flex flex-row items-center gap-2">
		<h1 class="font-display text-4xl font-semibold">
			{data.subject.name}
		</h1>
		<Badge class="mt-0.5" variant={subjectColor(data.subject.subjectTypeName, true)}>
			{data.subject.subjectTypeName}
		</Badge>
	</div>
</div>

<Tabs.Root value="material" class="w-full">
	<Tabs.List class="w-full">
		<Tabs.Trigger value="material">Material</Tabs.Trigger>
		<Tabs.Trigger value="assignment">Assignment</Tabs.Trigger>
		<Tabs.Trigger value="forum">Forum</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="material">Make changes to your material here.</Tabs.Content>
	<Tabs.Content value="assignment">Change your assignment here.</Tabs.Content>
	<Tabs.Content value="forum">Discuss topics in the forum here.</Tabs.Content>
</Tabs.Root>
