<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import type { Subject } from "$lib/schema/db";
	import { subjectColor, subjectAbbreviation, subjectBgColor } from "$lib/functions/subject";

	import Dna from "@lucide/svelte/icons/dna";
	import Calculator from "@lucide/svelte/icons/calculator";
	import UsersRound from "@lucide/svelte/icons/users-round";
	import Microscope from "@lucide/svelte/icons/microscope";
	import Shapes from "@lucide/svelte/icons/shapes";
	import Users from "@lucide/svelte/icons/users";
	import Atom from "@lucide/svelte/icons/atom";

	const Icons = $derived.by(() => {
		if (subject.name.toLocaleLowerCase().includes("bio")) return Dna;
		if (subject.name.toLocaleLowerCase().includes("math")) return Calculator;
		if (subject.name.toLocaleLowerCase().includes("science")) return Microscope;
		if (subject.name.toLocaleLowerCase().includes("history")) return UsersRound;
		if (subject.name.toLocaleLowerCase().includes("social")) return Users;
		if (subject.name.toLocaleLowerCase().includes("physics")) return Atom;

		return Shapes;
	});

	type SubjectWithName = Subject & { subjectTypeName: string };
	let { subject }: { subject: SubjectWithName } = $props();
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
