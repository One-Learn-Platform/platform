<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";

	import { formSchema } from "$lib/schema/announcement/schema";
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today,
	} from "@internationalized/date";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import Plus from "@lucide/svelte/icons/plus";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { toast } from "svelte-sonner";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import DataTable from "$lib/components/table/data-table.svelte";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import { columns } from "./columns";

	import { cn } from "$lib/utils";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const superform = superForm(data.form, {
		validators: zod4Client(formSchema),
	});

	const { form: formData, enhance, errors: formErrors } = superform;
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
		if (form?.delete) {
			if (form.delete.success)
				toast.success(`Announcement ${form.delete.data?.name} successfully deleted`);
			else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success)
					toast.success(`Announcement ${form.create.data?.name} successfully created`);
				else toast.error(form.create.message ?? "Unknown error");
			}
		}
	});

	let announcementList = $derived(data.announcement);
</script>

<div class="flex flex-col gap-2">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<Dialog.Header>
				<Dialog.Title>Add Announcement</Dialog.Title>
				<Dialog.Description
					>Create a new announcement by filling out the form below.</Dialog.Description
				>
			</Dialog.Header>
			<form method="POST" action="?/create" use:enhance class="space-y-2">
				<Form.Field form={superform} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Announcement Name</Form.Label>
							<Input {...props} bind:value={$formData.title} />
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
							<Textarea {...props} bind:value={$formData.content} class="resize-y" />
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
										minValue={valueStart ?? today(getLocalTimeZone())}
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

				<Dialog.Footer class="items-center">
					{#if $formErrors._errors}
						<FormErrors message={Object.values($formErrors._errors).join(", ")} />
					{/if}
					<Form.Button>Submit</Form.Button></Dialog.Footer
				>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={announcementList} {columns} />
</div>
