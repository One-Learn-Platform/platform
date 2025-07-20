<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";

	import { formSchema } from "$lib/schema/assignment/schema";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import { invalidateAll } from "$app/navigation";
	import { cn } from "$lib/utils.js";
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		parseZonedDateTime,
		today,
	} from "@internationalized/date";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { toast } from "svelte-sonner";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const superform = superForm(data.form, {
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors } = superform;
	const attachmentProxies = fileProxy(formData, "attachment");
	let attachmentNames = $state();

	let dueDate: string = $state("");
	let dueTime = $state("23:59:59");
	let dueValue = $derived(dueDate ? parseDate(dueDate) : undefined);
	let startDate: string = $state("");
	let startTime = $state("23:59:59");
	let startValue = $derived(startDate ? parseDate(startDate) : undefined);
	// @ts-expect-error - value is undefined so the browser default will be used
	const df = new DateFormatter(undefined, {
		dateStyle: "long",
	});

	$effect(() => {
		if (form) {
			if (form.create) {
				if (form.create.success) {
					toast.success(`Assignment successfully created`);
					invalidateAll();
				} else {
					toast.error(form.create.message ?? "Unknown error");
				}
			}
		}
	});
</script>

<div>
	<div class="mb-2">
		<h2 class="text-2xl font-medium">Assignment Information</h2>
		<Separator />
	</div>
	<form
		action="?/create"
		method="POST"
		class="flex flex-col space-y-2"
		enctype="multipart/form-data"
		use:enhance
	>
		<Form.Field form={superform} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Title</Form.Label>
					<Input {...props} bind:value={$formData.title} placeholder="First Learn" />
				{/snippet}
			</Form.Control>
			{#if $errors.title}
				<Form.FieldErrors />
			{:else}
				<Form.Description>Title of the material</Form.Description>
			{/if}
		</Form.Field>

		<Form.Field form={superform} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description</Form.Label>
					<Input {...props} bind:value={$formData.description} placeholder="First Learn" />
				{/snippet}
			</Form.Control>
			{#if $errors.description}
				<Form.FieldErrors />
			{:else}
				<Form.Description>Description of the material</Form.Description>
			{/if}
		</Form.Field>
		<Form.Field form={superform} name="quiz">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label
						class="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
					>
						<Checkbox
							{...props}
							bind:checked={$formData.quiz}
							class="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
						/>
						<div class="grid gap-1.5 font-normal">
							<p class="text-sm leading-none font-medium">Set this as <b>Bonus Quiz</b></p>
							<p class="text-sm text-muted-foreground">
								Bonus quiz can be taken by students to earn extra points but only limited to number
								of students you decide.
							</p>
						</div>
					</Form.Label>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<div class="grid gap-2 {$formData.quiz ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}">
			{#if $formData.quiz}
				<Form.Field
					form={superform}
					name="limitUser"
					class={$formData.quiz ? "col-span-1 sm:col-span-2" : "col-span-1"}
				>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Limit User</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$formData.limitUser}
								placeholder="1"
								min="1"
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>

				<Form.Field form={superform} name="startDate" class="">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex flex-row items-center gap-4">
								<div class="flex flex-col gap-1">
									<Form.Label>Start Date</Form.Label>
									<Popover.Root>
										<Popover.Trigger
											{...props}
											class={cn(
												buttonVariants({ variant: "outline" }),
												" text-left font-normal",
												!startValue && "text-muted-foreground",
											)}
										>
											{startValue
												? df.format(startValue.toDate(getLocalTimeZone()))
												: "Pick a date"}
											<CalendarIcon class="ml-auto size-4 opacity-50" />
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0" side="top">
											<Calendar
												captionLayout="dropdown"
												type="single"
												value={startValue as DateValue}
												maxValue={new CalendarDate(2100, 1, 1)}
												minValue={today(getLocalTimeZone())}
												calendarLabel="Start date"
												onValueChange={(v) => {
													if (v) {
														const dateStr = v.toString();
														startDate = dateStr;
														$formData.startDate = parseZonedDateTime(
															`${startDate}T${startTime}[${getLocalTimeZone()}]`,
														)
															.toAbsoluteString()
															.slice(0, 19)
															.replace("T", " ");
													} else {
														$formData.startDate = "";
													}
												}}
											/>
										</Popover.Content>
									</Popover.Root>
								</div>
								<div class="flex flex-col gap-1">
									<Label for="time" class="px-1">Time</Label>
									<Input
										type="time"
										bind:value={startTime}
										id="time"
										step="1"
										class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
										onchange={(v) => {
											if (v) {
												$formData.startDate = parseZonedDateTime(
													`${startDate}T${startTime}[${getLocalTimeZone()}]`,
												)
													.toAbsoluteString()
													.slice(0, 19)
													.replace("T", " ");
											} else {
												$formData.startDate = "";
											}
										}}
									/>
								</div>
							</div>
							<input type="hidden" hidden value={$formData.startDate} name={props.name} />
						{/snippet}
					</Form.Control>
					{#if $errors.startDate}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Date when students can start taking the assignment.</Form.Description>
					{/if}
				</Form.Field>
			{/if}

			<Form.Field form={superform} name="dueDate" class="">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex flex-row items-center gap-4">
							<div class="flex flex-col gap-1">
								<Form.Label>{$formData.quiz ? "End Date" : "Due Date"}</Form.Label>
								<Popover.Root>
									<Popover.Trigger
										{...props}
										class={cn(
											buttonVariants({ variant: "outline" }),
											" text-left font-normal",
											!dueValue && "text-muted-foreground",
										)}
									>
										{dueValue ? df.format(dueValue.toDate(getLocalTimeZone())) : "Pick a date"}
										<CalendarIcon class="ml-auto size-4 opacity-50" />
									</Popover.Trigger>
									<Popover.Content class="w-auto p-0" side="top">
										<Calendar
											captionLayout="dropdown"
											type="single"
											value={dueValue as DateValue}
											maxValue={new CalendarDate(2100, 1, 1)}
											minValue={startValue ?? today(getLocalTimeZone())}
											calendarLabel="Due date"
											onValueChange={(v) => {
												if (v) {
													const dateStr = v.toString();
													dueDate = dateStr;
													$formData.dueDate = parseZonedDateTime(
														`${dueDate}T${dueTime}[${getLocalTimeZone()}]`,
													)
														.toAbsoluteString()
														.slice(0, 19)
														.replace("T", " ");
												} else {
													$formData.dueDate = "";
												}
											}}
										/>
									</Popover.Content>
								</Popover.Root>
							</div>
							<div class="flex flex-col gap-1">
								<Label for="time" class="px-1">Time</Label>
								<Input
									type="time"
									bind:value={dueTime}
									id="time"
									step="1"
									class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									onchange={(v) => {
										if (v) {
											$formData.dueDate = parseZonedDateTime(
												`${dueDate}T${dueTime}[${getLocalTimeZone()}]`,
											)
												.toAbsoluteString()
												.slice(0, 19)
												.replace("T", " ");
										} else {
											$formData.dueDate = "";
										}
									}}
								/>
							</div>
						</div>
						<input type="hidden" hidden value={$formData.dueDate} name={props.name} />
					{/snippet}
				</Form.Control>
				{#if $errors.dueDate}
					<Form.FieldErrors />
				{:else}
					<Form.Description>Due date of the assignment.</Form.Description>
				{/if}
			</Form.Field>
		</div>

		<Form.Field form={superform} name="attachment" class="">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Attachment</Form.Label>
					<Input
						{...props}
						type="file"
						multiple
						bind:files={$attachmentProxies}
						bind:value={attachmentNames}
					/>
				{/snippet}
			</Form.Control>
			{#if $errors.attachment}
				<Form.FieldErrors />
			{:else}
				<Form.Description>Attach any files up to 100MB</Form.Description>
			{/if}
		</Form.Field>

		<Form.Button class="w-fit self-end">Next</Form.Button>
	</form>
</div>
