<script lang="ts">
	import { Calendar as CalendarPrimitive, type WithoutChildrenOrChild } from "bits-ui";
	import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
	import * as Calendar from "./index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { cn } from "$lib/utils.js";

	let {
		yearSelect = false,
		ref = $bindable(null),
		value = $bindable(),
		placeholder = $bindable(today(getLocalTimeZone())),
		class: className,
		weekdayFormat = "short",
		minValue,
		maxValue,
		...restProps
	}: { yearSelect: boolean } & WithoutChildrenOrChild<CalendarPrimitive.RootProps> = $props();

	const currentDate = today(getLocalTimeZone());
	const monthFmt = new DateFormatter("en-US", {
		month: "long",
	});
	const monthOptions = $derived.by(() => {
		return Array.from({ length: 12 }, (_, i) => {
			const monthIndex = i + 1;
			const month = currentDate.set({ month: monthIndex });

			return {
				value: month.month,
				label: monthFmt.format(month.toDate(getLocalTimeZone())),
				disabled:
					(minValue && placeholder.year === minValue.year && monthIndex < minValue.month) ||
					(maxValue && placeholder.year === maxValue.year && monthIndex > maxValue.month),
			};
		}).filter((option) => !option.disabled);
	});

	const yearOptions = $derived.by(() => {
		const minYear = minValue ? minValue.year : new Date().getFullYear() - 100;
		const maxYear = maxValue ? maxValue.year : new Date().getFullYear();

		const yearCount = maxYear - minYear + 1;
		return Array.from({ length: yearCount }, (_, i) => ({
			label: String(maxYear - i),
			value: maxYear - i,
		}));
	});
	const defaultYear = $derived(
		placeholder ? { value: placeholder.year, label: String(placeholder.year) } : undefined,
	);
	const defaultMonth = $derived(
		placeholder
			? {
					value: placeholder.month,
					label: monthFmt.format(placeholder.toDate(getLocalTimeZone())),
				}
			: undefined,
	);
	const monthLabel = $derived(
		monthOptions.find((m) => m.value === defaultMonth?.value)?.label ?? "Select a month",
	);
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<CalendarPrimitive.Root
	bind:value={value as never}
	bind:ref
	bind:placeholder
	{weekdayFormat}
	{minValue}
	{maxValue}
	class={cn("rounded-md border p-3", className)}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		{#if yearSelect}
			<Calendar.Header class="flex w-full items-center justify-between gap-2">
				<Select.Root
					type="single"
					value={`${defaultMonth?.value}`}
					onValueChange={(v) => {
						if (!placeholder) return;
						if (v === `${placeholder.month}`) return;
						placeholder = placeholder.set({ month: Number.parseInt(v) });
					}}
				>
					<Select.Trigger aria-label="Select month" class="w-[60%]">
						{monthLabel}
					</Select.Trigger>
					<Select.Content class="max-h-[200px] overflow-y-auto">
						<Select.Group>
							<Select.GroupHeading>Month</Select.GroupHeading>
							{#each monthOptions as { value, label } (value)}
								<Select.Item value={`${value}`} {label} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Select.Root
					type="single"
					value={`${defaultYear?.value}`}
					onValueChange={(v) => {
						if (!v || !placeholder) return;
						if (v === `${placeholder?.year}`) return;
						placeholder = placeholder.set({ year: Number.parseInt(v) });
					}}
				>
					<Select.Trigger aria-label="Select year" class="w-[40%]">
						{defaultYear?.label ?? "Select year"}
					</Select.Trigger>
					<Select.Content class="max-h-[200px] overflow-y-auto">
						<Select.Group>
							<Select.GroupHeading>Year</Select.GroupHeading>
							{#each yearOptions as { value, label } (value)}
								<Select.Item value={`${value}`} {label} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Calendar.Header>
			<Calendar.Months>
				{#each months as month (month)}
					<Calendar.Grid>
						<Calendar.GridHead>
							<Calendar.GridRow class="flex">
								{#each weekdays as weekday (weekday)}
									<Calendar.HeadCell>
										{weekday.slice(0, 2)}
									</Calendar.HeadCell>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as weekDates (weekDates)}
								<Calendar.GridRow class="mt-2 w-full">
									{#each weekDates as date (date)}
										<Calendar.Cell class="select-none" {date} month={month.value}>
											<Calendar.Day />
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				{/each}
			</Calendar.Months>
		{:else}
			<Calendar.Header>
				<Calendar.PrevButton />
				<Calendar.Heading />
				<Calendar.NextButton />
			</Calendar.Header>
			<Calendar.Months>
				{#each months as month (month)}
					<Calendar.Grid>
						<Calendar.GridHead>
							<Calendar.GridRow class="flex">
								{#each weekdays as weekday (weekday)}
									<Calendar.HeadCell>
										{weekday.slice(0, 2)}
									</Calendar.HeadCell>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as weekDates (weekDates)}
								<Calendar.GridRow class="mt-2 w-full">
									{#each weekDates as date (date)}
										<Calendar.Cell {date} month={month.value}>
											<Calendar.Day />
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				{/each}
			</Calendar.Months>
		{/if}
	{/snippet}
</CalendarPrimitive.Root>
