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

	type SubjectWithName = Subject & { subjectTypeName: string; gradeLevel?: number };
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
					class="group flex h-fit w-full flex-col items-stretch justify-start gap-0 overflow-hidden p-0"
					href={`/subject/${subject.code}`}
				>
					<div
						class={[
							"w-full px-3 py-3 duration-150 group-hover:opacity-90 sm:py-6",
							subjectBgColor(subject.subjectTypeName),
						]}
					>
						<Icons class="size-10 text-background lg:size-12 xl:size-14" />
					</div>
					<div class="">
						<div class="flex flex-row items-stretch justify-between gap-2">
							<div class="w-1/2 grow px-3 pt-2 pb-3 sm:space-y-1">
								<div class="flex items-center gap-2">
									<span class="font-mono tracking-tight text-muted-foreground">
										{subject.code}
									</span>
									<Badge variant={subjectColor(subject.subjectTypeName)}>
										{subjectAbbreviation(subject.subjectTypeName)}
									</Badge>
								</div>
								<div class="truncate text-lg font-semibold lg:text-2xl">
									{subject.name}
								</div>
							</div>
							{#if subject.gradeLevel}
								<div
									class="flex flex-col items-center justify-center border-l px-3 text-center text-base font-medium text-muted-foreground tabular-nums"
								>
									<p class="max-sm:hidden">Grade</p>
									<p class="font-display">{subject.gradeLevel}</p>
								</div>
							{/if}
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
