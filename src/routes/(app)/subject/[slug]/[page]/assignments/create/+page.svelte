<script lang="ts">
	import type { PageServerData } from "./$types";

	import { formSchema } from "$lib/schema/assignment/schema";
	import { filesProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import { getFileIcon } from "$lib/functions/material";
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
	import X from "@lucide/svelte/icons/x";

	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	let { data }: { data: PageServerData } = $props();

	const superform = superForm(data.form, {
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors } = superform;
	const attachmentProxies = filesProxy(formData, "attachment");
	let attachmentNames = $state();

	let date: string = $state("");
	let time = $state("23:59:59");
	let value = $derived(date ? parseDate(date) : undefined);
	// @ts-expect-error - value is undefined so the browser default will be used
	const df = new DateFormatter(undefined, {
		dateStyle: "long",
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

		<Form.Field form={superform} name="dueDate" class="">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex flex-col items-center gap-4 sm:flex-row">
						<div class="flex flex-col gap-1">
							<Form.Label>Due Date</Form.Label>
							<Popover.Root>
								<Popover.Trigger
									{...props}
									class={cn(
										buttonVariants({ variant: "outline" }),
										" text-left font-normal",
										!value && "text-muted-foreground",
									)}
								>
									{value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
									<CalendarIcon class="ml-auto size-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" side="top">
									<Calendar
										captionLayout="dropdown"
										type="single"
										value={value as DateValue}
										maxValue={new CalendarDate(2100, 1, 1)}
										minValue={today(getLocalTimeZone())}
										calendarLabel="Due date"
										onValueChange={(v) => {
											if (v) {
												const dateStr = v.toString();
												date = dateStr;
												$formData.dueDate = parseZonedDateTime(
													`${date}T${time}[${getLocalTimeZone()}]`,
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
								bind:value={time}
								id="time"
								step="1"
								class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
								onchange={(v) => {
									if (v) {
										$formData.dueDate = parseZonedDateTime(`${date}T${time}[${getLocalTimeZone()}]`)
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

		<ul class="flex flex-col gap-1">
			{#each $attachmentProxies as file (file.name)}
				{@const Icons = getFileIcon(file.name)}
				<li class="flex w-fit flex-row items-center gap-1 rounded-sm border px-2 py-1">
					<Icons class="size-5" />
					<span class="text-sm">{file.name}</span>
					<Tooltip.Provider delayDuration={150} disableHoverableContent>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="destructive"
										size="icon"
										type="button"
										class="ml-2 h-fit w-fit rounded-xs"
										outline
										onclick={() => {
											const filesArray = Array.from($attachmentProxies);
											const filteredFiles = filesArray.filter((f) => f.name !== file.name);
											const dataTransfer = new DataTransfer();
											filteredFiles.forEach((f) => dataTransfer.items.add(f));
											$attachmentProxies = dataTransfer.files;
										}}
									>
										<X />
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content side="right">
								<p>Remove file</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</li>
			{/each}
		</ul>

		<Form.Button class="w-fit self-end">Next</Form.Button>
	</form>
</div>
