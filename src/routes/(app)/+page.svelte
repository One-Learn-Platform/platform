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
				{#if data.leaderboard && data.leaderboard.length > 0}
					{#each data.leaderboard as item, index (item.userId)}
						{#if item.score && item.score >= scoreThreshold}
							<Table.Row
								class="
          {index === 0 ? 'bg-yellow-100 dark:bg-yellow-500/10' : ''}
          {index === 1 ? 'bg-slate-100 dark:bg-slate-500/10' : ''}
          {index === 2 ? 'bg-amber-100 dark:bg-amber-600/10' : ''}"
							>
								<Table.Cell class="text-center font-medium">
									{#if index === 0}
										<Crown class="text-yellow-400" />
									{:else if index === 1}
										<Crown class="text-slate-400" />
									{:else if index === 2}
										<Crown class="text-amber-400 dark:text-amber-500" />
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
								<Table.Cell class="font-mono font-medium">{item.score}</Table.Cell>
							</Table.Row>
						{/if}
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

<div class="mt-8 flex flex-col items-center gap-2 text-muted-foreground italic">
	"{data.quote.advice}"
</div>
