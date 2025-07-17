<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageServerData, PageParentData } from "./$types";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import { acronym } from "$lib/utils";

	let { data }: { data: PageServerData & PageParentData } = $props();
</script>

<div class="mb-4 space-y-1">
	<h1 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">People</h1>
	<Separator class="" />
</div>
<section class="mb-4 space-y-2">
	<div>
		<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Teacher</h2>
		<Separator />
	</div>
	{#if data.teacher}
		{@const initial = acronym(data.teacher.fullname)}
		<div class="flex items-center gap-2 rounded-lg border p-2">
			<Avatar.Root>
				<Avatar.Image src="{PUBLIC_R2_URL}/{data.teacher.avatar}" alt="" />
				<Avatar.Fallback>{initial}</Avatar.Fallback>
			</Avatar.Root>
			<p class="text-lg font-semibold">{data.teacher?.fullname}</p>
		</div>
	{:else}
		<p>No teacher assigned to this subject.</p>
	{/if}
</section>

<section class="space-y-2">
	<div>
		<div class="flex flex-row items-end justify-between gap-1">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Students</h2>
			<p class="text-sm text-muted-foreground">{data.students.length} enrolled</p>
		</div>
		<Separator />
	</div>
	{#if data.students && data.students.length !== 0}
		<ul
			class="flex flex-col place-items-stretch gap-2 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
		>
			{#each data.students as student, index (student.id)}
				{@const initial = acronym(student.fullname)}
				<li class="flex gap-0 sm:flex-col sm:items-stretch">
					<div
						class="flex items-center justify-center rounded-lg border bg-muted px-2 text-center text-lg font-medium shadow-xs max-sm:-mr-2 max-sm:rounded-r-none max-sm:pr-4 sm:-mb-2 sm:rounded-b-none sm:px-4 sm:pb-2 sm:text-xl"
					>
						{index + 1}
					</div>
					<div
						class="flex grow items-center gap-2 rounded-lg border bg-background shadow-sm max-sm:pl-2 sm:flex-col"
					>
						<div class="flex grow flex-row items-center gap-2 py-4">
							<Avatar.Root class="sm:size-12">
								<Avatar.Image src="{PUBLIC_R2_URL}/{student.avatar}" alt="" />
								<Avatar.Fallback>{initial}</Avatar.Fallback>
							</Avatar.Root>
							<div class="sm:text-center">
								<p class="text-lg font-semibold">{student.fullname}</p>
								<p class="text-sm text-muted-foreground">{student.username}</p>
							</div>
						</div>
						{#if data.user.role === 3}
							<div
								class="flex h-full flex-row items-center justify-center px-4 text-sm font-medium text-muted-foreground max-sm:border-l sm:w-full sm:border-t sm:py-1 sm:text-center sm:text-base"
							>
								<p>
									Score: <span
										class="text-end font-display text-lg font-bold text-foreground! tabular-nums sm:text-xl"
									>
										{student.score ?? "-"}
									</span>
								</p>
							</div>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No students enrolled in this subject.</p>
	{/if}
</section>
