<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import type { Subject } from "$lib/schema/db";
	import {
		subjectColor,
		subjectAbbreviation,
		subjectBgColor,
		subjectIcon,
	} from "$lib/functions/subject";

	type SubjectWithName = Subject & { subjectTypeName: string };
	let { subject }: { subject: SubjectWithName } = $props();
	const Icons = $derived(subjectIcon(subject.name));
</script>

<Tooltip.Provider delayDuration={150} disableHoverableContent>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					class="group flex h-fit w-full flex-col items-stretch justify-start gap-2 overflow-hidden p-0"
					href={`/subject/${subject.code}`}
				>
					<div
						class={[
							"w-full px-6 pt-6 pb-6 duration-150 group-hover:opacity-90",
							subjectBgColor(subject.subjectTypeName),
						]}
					>
						<Icons class="size-12 text-background lg:size-14 xl:size-16" />
					</div>
					<div class="px-6 pb-6">
						<div class="flex items-center gap-2">
							<span class="font-mono tracking-tight text-muted-foreground">
								{subject.code}
							</span>
							<Badge variant={subjectColor(subject.subjectTypeName)}>
								{subjectAbbreviation(subject.subjectTypeName)}
							</Badge>
						</div>
						<div class="truncate text-xl font-semibold lg:text-2xl">
							{subject.name}
						</div>
					</div>
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content side="bottom" class="max-w-sm">
			<p>{subject.name}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
