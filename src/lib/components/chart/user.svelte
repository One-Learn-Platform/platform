<script lang="ts">
	import type { User } from "$lib/schema/db";
	import { cubicInOut } from "svelte/easing";

	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";

	import { scaleBand } from "d3-scale";
	import { BarChart, Highlight, type ChartContextValue } from "layerchart";

	import { groupUsers } from "$lib/functions/db";

	let { userList }: { userList: Omit<User, "password">[] } = $props();

	let groupBy: "month" | "date" | "year" = $state("month");
	const groupedUsers = $derived.by(() => {
		switch (groupBy) {
			case "month":
				return groupUsers(userList, "month");
			case "date":
				return groupUsers(userList, "day");
			case "year":
				return groupUsers(userList, "year");
			default:
				return [];
		}
	});
	const userStats = $derived.by(() => {
		return groupedUsers.map((group) => ({
			period: group.period,
			count: group.count,
			admin: group.admin,
			student: group.student,
			teacher: group.teacher,
			super_admin: group.super_admin,
		}));
	});
	const maxCount = $derived.by(() => {
		return Math.max(...userStats.map((stat) => stat.count), 0);
	});

	let context = $state<ChartContextValue>();
	let split = $state(false);

	const chartData = $derived(userStats);

	const chartConfigSplit = {
		super_admin: {
			label: "Super Admins",
			color: "var(--chart-1)",
		},
		admin: {
			label: "Admins",
			color: "var(--chart-2)",
		},
		student: {
			label: "Students",
			color: "var(--chart-3)",
		},
		teacher: {
			label: "Teachers",
			color: "var(--chart-4)",
		},
	} satisfies Chart.ChartConfig;
	const chartConfigMix = {
		count: {
			label: "User",
			color: "var(--chart-1)",
		},
	} satisfies Chart.ChartConfig;
	const chartConfig = $derived(split ? chartConfigSplit : chartConfigMix);
	const seriesConfig = $derived.by(() => {
		if (split) {
			return [
				{
					key: "super_admin",
					label: "Super Admins",
					color: "var(--chart-1)",
				},
				{
					key: "admin",
					label: "Admins",
					color: "var(--chart-2)",
				},
				{
					key: "student",
					label: "Students",
					color: "var(--chart-3)",
				},
				{
					key: "teacher",
					label: "Teachers",
					color: "var(--chart-4)",
				},
			];
		}
		return [
			{
				key: "count",
				label: "Users",
				color: "var(--chart-1)",
			},
		];
	});
</script>

<Card.Root class="w-full">
	<Card.Header class="flex w-full flex-col border-b">
		<div class="flex w-full items-center gap-2 space-y-0 py-5 sm:flex-row">
			<div class="grid flex-1 gap-1 text-center sm:text-left">
				<Card.Title>User Statistics</Card.Title>
				<Card.Description>Number of users created.</Card.Description>
			</div>
			<Select.Root type="single" bind:value={groupBy}>
				<Select.Trigger class="w-[160px] rounded-lg sm:ml-auto"
					>{groupBy.replace(/^\w/, (c) => c.toUpperCase())}</Select.Trigger
				>
				<Select.Content>
					{#each ["date", "month", "year"] as value (value)}
						<Select.Item {value}>{value.replace(/^\w/, (c) => c.toUpperCase())}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex w-full items-center gap-2 rounded-sm border p-2 text-sm text-muted-foreground">
			<p class="grow">Split user based on role</p>
			<Switch bind:checked={split} />
		</div>
	</Card.Header>
	<Card.Content class="h-fit px-2 sm:p-6">
		<Chart.Container config={chartConfig} class="h-[250px] min-h-[200px] w-full">
			{#key chartData}
				<BarChart
					bind:context
					data={chartData}
					xScale={scaleBand().padding(0.25)}
					x="period"
					y="count"
					axis={true}
					yDomain={[0, null]}
					seriesLayout="group"
					legend={split}
					series={seriesConfig}
					props={{
						bars: {
							rounded: "all",
							radius: 8,
							stroke: "none",
							// use the height of the chart to animate the bars
							initialY: context?.height,
							initialHeight: 0,
							motion: {
								y: { type: "tween", duration: 500, easing: cubicInOut },
								height: { type: "tween", duration: 500, easing: cubicInOut },
							},
						},
						xAxis: {
							format: (d) =>
								new Date(d).toLocaleDateString(undefined, {
									month: groupBy === "month" || groupBy === "date" ? "short" : undefined,
									day: groupBy === "date" ? "numeric" : undefined,
									year: groupBy === "year" || groupBy === "month" ? "numeric" : undefined,
								}),
						},
						yAxis: {
							class: "font-mono",
							ticks: maxCount > 0 ? maxCount : 1,
						},
					}}
				>
					{#snippet belowMarks()}
						<Highlight area={{ class: "fill-muted" }} />
					{/snippet}
					{#snippet tooltip()}
						<Chart.Tooltip
							indicator="dot"
							labelFormatter={(d) =>
								new Date(d).toLocaleDateString(undefined, {
									month: groupBy === "month" || groupBy === "date" ? "long" : undefined,
									day: groupBy === "date" ? "numeric" : undefined,
									year: "numeric",
								})}
						/>
					{/snippet}
				</BarChart>
			{/key}
		</Chart.Container>
	</Card.Content>
</Card.Root>
