<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageServerData } from "./$types";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Card from "$lib/components/ui/card/index.js";

	import Crown from "@lucide/svelte/icons/crown";

	import { acronym } from "$lib/utils";

	let { data }: { data: PageServerData } = $props();
	const scoreThreshold = 50;

	const groupedLeaderboard = $derived.by(() => {
		const groupsMap = new Map<
			number,
			{
				userId: number;
				avatar: string | null;
				fullname: string;
				scores: number[];
				averageScore: number;
				assignmentFinished: number;
			}
		>();

		data.leaderboard.forEach((item) => {
			if (!groupsMap.has(item.userId)) {
				groupsMap.set(item.userId, {
					userId: item.userId,
					avatar: item.avatar,
					fullname: item.fullname,
					scores: [],
					averageScore: 0,
					assignmentFinished: 0,
				});
			}

			const group = groupsMap.get(item.userId)!;
			if (item.score !== null) {
				group.scores.push(item.score);
			}
		});

		return Array.from(groupsMap.values())
			.map((group) => ({
				...group,
				averageScore:
					group.scores.length > 0
						? Math.round(group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length)
						: 0,
				submissionCount: group.scores.length,
			}))
			.sort((a, b) => b.averageScore - a.averageScore);
	});
</script>

<h1 class="font-display text-5xl font-semibold tracking-tight">Dashboard</h1>
<Card.Root>
	<Card.Header>
		<Card.Title>Leaderboard</Card.Title>
	</Card.Header>
	<Card.Content>
		<Table.Root class="">
			<Table.Caption>Don't give up and keep pushing forward!</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[50px]"></Table.Head>
					<Table.Head class="w-[100px]">Avatar</Table.Head>
					<Table.Head class="">Name</Table.Head>
					<Table.Head class="">Score</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each groupedLeaderboard as item, index (item.userId)}
					{#if item.averageScore >= scoreThreshold}
						<Table.Row
							class="
        {index === 0 ? 'bg-yellow-100' : ''}
          {index === 1 ? 'bg-slate-100' : ''}
          {index === 2 ? 'bg-amber-100' : ''}"
						>
							<Table.Cell class="text-center font-medium">
								{#if index === 0}
									<Crown class="text-yellow-400" />
								{:else if index === 1}
									<Crown class="text-slate-400" />
								{:else if index === 2}
									<Crown class="text-amber-400" />
								{:else}
									{index + 1}
								{/if}
							</Table.Cell>
							<Table.Cell class="">
								{#if item.avatar}
									<img src="{PUBLIC_R2_URL}/{item.avatar}" alt="" class="h-8 w-8 rounded-full" />
								{:else}
									<Avatar.Root class="h-8 w-8">
										<Avatar.Fallback>{acronym(item.fullname)}</Avatar.Fallback>
									</Avatar.Root>
								{/if}
							</Table.Cell>
							<Table.Cell>{item.fullname}</Table.Cell>
							<Table.Cell class="font-mono font-medium">{item.averageScore}</Table.Cell>
						</Table.Row>
					{/if}
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

<div class="mt-8 flex flex-col items-center gap-2">
	<blockquote cite="https://www.huxley.net/bnw/four.html">
		<p>
			{data.quote.quote}
		</p>
	</blockquote>
	<p>—<cite>{data.quote.author}</cite></p>
</div>
