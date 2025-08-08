<script lang="ts">
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import type { PageServerData } from "./$types";

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import {
		subjectAbbreviation,
		subjectBgColor,
		subjectColor,
		subjectIcon,
		subjectTextColor,
	} from "$lib/functions/subject";

	let { data }: { data: PageServerData } = $props();

	let searchQuery = $state("");
	const filteredSubjects = $derived(
		data.subjectList?.filter(
			(subject) =>
				subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				subject.subjectTypeName.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);
</script>

<svelte:head>
	<title>Subjects | One Learn</title>
</svelte:head>

<h1 class="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
	Subjects
</h1>
<Input
	type="search"
	placeholder="Search subjects by code or name"
	bind:value={searchQuery}
	class="mb-4 w-full max-w-sm"
/>
{#if filteredSubjects && filteredSubjects.length > 0}
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredSubjects as subject (subject.id)}
			{@const Icons = subjectIcon(subject.name)}
			<div
				transition:fade={{ duration: 200, easing: cubicOut }}
				animate:flip={{ duration: 300, easing: cubicOut }}
			>
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
										class="w-full px-3 py-3 duration-150 group-hover:opacity-90 sm:py-6
                    {subjectBgColor(subject.subjectTypeName, true)}"
									>
										<Icons
											class="size-10 text-background lg:size-12 xl:size-14 
                      {subjectTextColor(subject.subjectTypeName)} "
										/>
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
												<div class="truncate text-lg font-semibold tracking-tight lg:text-2xl">
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
			</div>
		{/each}
	</div>
{:else}
	<div class="flex grow items-center justify-center text-center">
		<p class="font-display text-2xl font-medium tracking-tight text-muted-foreground">
			No subjects found.
		</p>
	</div>
{/if}
