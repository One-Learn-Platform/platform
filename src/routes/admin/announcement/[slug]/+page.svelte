<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import type { PageProps } from "./$types";

	import { formSchema } from "$lib/schema/announcement/schema";
	import { clsx } from "clsx";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { cn } from "$lib/utils.js";
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today,
	} from "@internationalized/date";
	import CalendarIcon from "@lucide/svelte/icons/calendar";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";

	let { data, form }: PageProps = $props();

	const announcementDetail = $derived(data.announcementData);

	let changes = $state({
		title: false,
		content: false,
		startDate: false,
		endDate: false,
	});
	const isChanged = $derived(changes);
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
		id: "edit",

		onChange(event) {
			if (event) {
				if (event.paths.includes("title")) {
					if ($formData.title !== announcementDetail.title) {
						changes.title = true;
					} else {
						changes.title = false;
					}
				} else if (event.paths.includes("content")) {
					if ($formData.content !== announcementDetail.content) {
						changes.content = true;
					} else {
						changes.content = false;
					}
				} else if (event.paths.includes("startDate")) {
					if ($formData.startDate !== announcementDetail.startDate) {
						changes.startDate = true;
					} else {
						changes.startDate = false;
					}
				} else if (event.paths.includes("endDate")) {
					if ($formData.endDate !== announcementDetail.endDate) {
						changes.endDate = true;
					} else {
						changes.endDate = false;
					}
				} else {
					changes.title = false;
					changes.content = false;
					changes.startDate = false;
					changes.endDate = false;
				}
			}
		},
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;

	let valueStart: DateValue | undefined = $derived(
		$formData.startDate ? parseDate($formData.startDate) : undefined,
	);

	let valueEnd: DateValue | undefined = $derived(
		$formData.endDate ? parseDate($formData.endDate) : undefined,
	);
	// @ts-expect-error - value is undefined so the browser default will be used
	const df = new DateFormatter(undefined, {
		dateStyle: "long",
	});

	$effect(() => {
		$formData.title = announcementDetail.title;
		$formData.content = announcementDetail.content;
		$formData.startDate = announcementDetail.startDate;
		$formData.endDate = announcementDetail.endDate ? announcementDetail.endDate : "";
	});

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		} else if (form?.edit) {
			if (form.edit.success) {
				toast.success(`User ${form.edit.data?.title} edited successfully`);
				invalidateAll();
			} else toast.error(form.edit.message ?? "Unknown error");
		}
	});
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">Announcement Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit Announcement</Card.Title>
		</Card.Header>
		<form
			method="POST"
			action="?/edit{page.url.searchParams.get('ref')
				? '&ref=' + page.url.searchParams.get('ref')
				: ''}"
			class="space-y-2"
			use:enhance
		>
			<Card.Content class="space-y-2">
				<Form.Field form={superform} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Announcement Name</Form.Label>
							<Input
								{...props}
								bind:value={$formData.title}
								class={changes.title ? changesClass : ""}
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrors.title}
						<Form.FieldErrors />
					{:else}
						<Form.Description>
							This is the Announcement Title that will be displayed to users.
						</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="content">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Announcement Content</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.content}
								class={[changes.content ? changesClass : "", "resize-y"]}
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrors.content}
						<Form.FieldErrors />
					{:else}
						<Form.Description>
							This is the Announcement Content that will be displayed to users.
						</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="startDate" class="col-span-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Start Date</Form.Label>
							<Popover.Root>
								<Popover.Trigger
									{...props}
									class={cn(
										buttonVariants({ variant: "outline" }),
										changes.startDate ? changesClass : "",
										"w-full text-left font-normal",
										!valueStart && "text-muted-foreground",
									)}
								>
									{valueStart ? df.format(valueStart.toDate(getLocalTimeZone())) : "Pick a date"}
									<CalendarIcon class="ml-auto size-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" side="top">
									<Calendar
										captionLayout="dropdown"
										type="single"
										value={valueStart as DateValue}
										maxValue={new CalendarDate(2100, 12, 31)}
										minValue={today(getLocalTimeZone())}
										calendarLabel="Start Date"
										onValueChange={(v) => {
											if (v) {
												$formData.startDate = v.toString();
											} else {
												$formData.startDate = "";
											}
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<input type="hidden" hidden value={$formData.startDate} name={props.name} />
						{/snippet}
					</Form.Control>
					{#if $formErrors.startDate}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Start date of the announcement.</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="endDate" class="">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>End Date</Form.Label>
							<Popover.Root>
								<Popover.Trigger
									{...props}
									class={cn(
										buttonVariants({ variant: "outline" }),
										changes.endDate ? changesClass : "",
										"w-full text-left font-normal",
										!valueEnd && "text-muted-foreground",
									)}
								>
									{valueEnd ? df.format(valueEnd.toDate(getLocalTimeZone())) : "Pick a date"}
									<CalendarIcon class="ml-auto size-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" side="top">
									<Calendar
										captionLayout="dropdown"
										type="single"
										value={valueEnd as DateValue}
										maxValue={new CalendarDate(2100, 12, 31)}
										minValue={today(getLocalTimeZone())}
										calendarLabel="End Date"
										onValueChange={(v) => {
											if (v) {
												$formData.endDate = v.toString();
											} else {
												$formData.endDate = "";
											}
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<input type="hidden" hidden value={$formData.endDate} name={props.name} />
						{/snippet}
					</Form.Control>
					{#if $formErrors.endDate}
						<Form.FieldErrors />
					{:else}
						<Form.Description>End date of the announcement.</Form.Description>
					{/if}
				</Form.Field>
			</Card.Content>

			<Card.Footer class="justify-end gap-4">
				{#if $formErrors._errors}
					<FormErrors message={Object.values($formErrors._errors).join(", ")} />
				{/if}
				<Button
					variant="outline"
					type="button"
					disabled={!isChanged}
					onclick={() => {
						reset({
							data: {
								title: announcementDetail.title,
								content: announcementDetail.content,
								startDate: announcementDetail.startDate,
								endDate: announcementDetail.endDate ? announcementDetail.endDate : "",
							},
						});
						changes.content = false;
						changes.title = false;
						changes.startDate = false;
						changes.endDate = false;
					}}>Cancel</Button
				>
				<Form.Button disabled={!isChanged}>Save Changes</Form.Button>
			</Card.Footer>
		</form>
	</Card.Root>

	<AlertDialog.Root>
		<AlertDialog.Trigger class={buttonVariants({ variant: "destructive" })}>
			Delete
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<form class="contents" action="?/delete" method="POST" use:svelteEnhance>
				<AlertDialog.Header>
					<AlertDialog.Title>
						Do you want to delete announcement {announcementDetail.title}?
					</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={announcementDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{announcementDetail.title}</b>?
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
				</AlertDialog.Footer>
			</form>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
