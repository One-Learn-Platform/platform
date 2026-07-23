<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageServerData } from "./$types";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	import BookMarked from "@lucide/svelte/icons/book-marked";
	import Crown from "@lucide/svelte/icons/crown";
	import Quote from "@lucide/svelte/icons/quote";
	import TrendingUp from "@lucide/svelte/icons/trending-up";
	import Trophy from "@lucide/svelte/icons/trophy";
	import Users from "@lucide/svelte/icons/users";

	import { acronym } from "$lib/utils";
	import { PersistedState } from "runed";

	let { data }: { data: PageServerData } = $props();
	const scoreThreshold = 50;

	let selectedGrade = new PersistedState<{ title: string; number: string; id: number } | null>(
		"selectedGrade",
		null,
	);

	const filteredLeaderboard = $derived.by(() => {
		if (!data.leaderboard || !selectedGrade.current) return data.leaderboard;
		if (selectedGrade.current.number === "all") {
			return data.leaderboard;
		}
		const gradeLevel = Number(selectedGrade.current.number);
		return data.leaderboard.filter((item) => {
			return item.gradeLevel === gradeLevel;
		});
	});

	const ownEntry = $derived.by(() => {
		if (!data.leaderboard) return null;
		const index = data.leaderboard.findIndex((item) => item.userId === data.user?.id);
		if (index === -1) return null;
		return { position: index + 1, ...data.leaderboard[index] };
	});

	const rankMedal = $derived(
		ownEntry && ownEntry.position <= 3
			? (["text-yellow-400", "text-slate-400", "dark:text-amber-500 text-amber-400"] as const)[
					ownEntry.position - 1
				]
			: null,
	);

	const stats = $derived([
		{
			title: "Your Rank",
			number: ownEntry ? `#${ownEntry.position}` : "—",
			icon: Trophy,
			personal: true,
		},
		{
			title: "Your Average Score",
			number: ownEntry?.score ? Number(ownEntry.score).toFixed(1) : "—",
			icon: TrendingUp,
			personal: true,
		},
		{
			title: "Subjects Enrolled",
			number: ownEntry?.totalSubjects ?? "—",
			icon: BookMarked,
			personal: false,
		},
		{
			title: "Students Ranked",
			number: data.leaderboard?.length ?? 0,
			icon: Users,
			personal: false,
		},
	]);
</script>

<div>
	<h1
		class="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl"
	>
		Dashboard
	</h1>
	<p class="text-muted-foreground">
		Welcome back{data.user?.fullname ? `, ${data.user.fullname.split(" ")[0]}` : ""}.
	</p>
</div>

<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
	{#each stats as stat (stat.title)}
		<Card.Root class={stat.personal ? "border-primary/25" : ""}>
			<Card.Header>
				<Card.Title class="text-sm font-medium text-muted-foreground">{stat.title}</Card.Title>
				<Card.Action>
					<stat.icon class={["size-4", stat.personal ? "text-primary" : "text-muted-foreground"]} />
				</Card.Action>
			</Card.Header>
			<Card.Content
				class={[
					"font-mono text-3xl font-semibold tracking-tight",
					stat.title === "Your Rank" && rankMedal,
				]}
			>
				{stat.number}
			</Card.Content>
		</Card.Root>
	{/each}
</div>
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
				{#if filteredLeaderboard && filteredLeaderboard.length > 0}
					{#each filteredLeaderboard as item, index (`${item.userId}-${item.gradeLevel}`)}
						{#if item.score && Number(item.score) >= scoreThreshold}
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

<Card.Root>
	<Card.Content class="flex flex-col items-center gap-2 py-8 text-center">
		<Quote class="size-5 text-primary/40" />
		<p class="max-w-prose text-balance text-muted-foreground italic">{data.quote.advice}</p>
	</Card.Content>
</Card.Root>
