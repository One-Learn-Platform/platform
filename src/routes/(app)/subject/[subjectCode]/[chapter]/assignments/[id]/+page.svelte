<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { page } from "$app/state";
	import { invalidateAll } from "$app/navigation";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import { untrack } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fly, slide } from "svelte/transition";
	import type { ActionData, PageServerData, PageServerParentData } from "./$types";

	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import type { Question } from "$lib/types/assignment";

	import { formSchema } from "$lib/schema/assignment/schema";
	import { cn } from "$lib/utils.js";
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseAbsoluteToLocal,
		parseDate,
		parseZonedDateTime,
		Time,
		today,
	} from "@internationalized/date";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { filesProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import Check from "@lucide/svelte/icons/check";
	import Copy from "@lucide/svelte/icons/copy";
	import OctagonAlert from "@lucide/svelte/icons/octagon-alert";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash from "@lucide/svelte/icons/trash";
	import X from "@lucide/svelte/icons/x";
	import { toast } from "svelte-sonner";
	import { v4 as uuidv4 } from "uuid";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import * as Alert from "$lib/components/ui/alert/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import { getFileCategory, getFileIcon } from "$lib/functions/material";

	let { data, form }: { data: PageServerData & PageServerParentData; form: ActionData } = $props();
	const assignmentData = $derived(data.assignment);
	const isQuiz = $derived(
		data.assignment.limitUser && data.assignment.limitUser > 0 ? true : false,
	);

	const superform = superForm(data.form, {
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors } = superform;
	const attachmentProxies = filesProxy(formData, "attachment");
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

	const role = $derived(data.user.role);
	const assignmentAttachment = $derived(
		data.assignment?.attachment ? JSON.parse(data.assignment.attachment) : undefined,
	) as string[];

	let questionsList: Question[] = $state([]);
	$effect(() => {
		const list: Question[] = [];
		const questions = data.questions;
		for (const question of questions) {
			const key = uuidv4();
			if (question.questionType === "multiple-choice") {
				if (question.choice) {
					const type = "multiple-choice" as const;
					const choice = JSON.parse(question.choice) as string[];
					const choices = choice.map((c) => ({
						key: uuidv4(),
						value: c,
					}));
					const correctChoice = choices.find((c) => c.value === question.answer)?.key;
					list.push({
						key,
						type,
						question: question.question,
						answer: question.answer,
						choices,
						correctChoice: correctChoice ? correctChoice : "",
						attachment: question.attachment
							? (JSON.parse(question.attachment) as string[])
							: undefined,
					});
				}
			} else {
				list.push({
					key,
					type: question.questionType,
					question: question.question,
					answer: question.answer,
					attachment: question.attachment
						? (JSON.parse(question.attachment) as string[])
						: undefined,
				});
			}
		}
		untrack(() => (questionsList = list));
	});
	$effect(() => {
		if (form) {
			if (form.create) {
				if (form.create.success) {
					$formData.title = data.assignment.title;
					$formData.description = data.assignment.description;
					$formData.dueDate = data.assignment.dueDate;
					$formData.quiz = isQuiz;
					if (data.assignment.dueDate) {
						try {
							const dueDateString = data.assignment.dueDate.replace(" ", "T").concat("Z");
							const dueLocalDate = parseAbsoluteToLocal(dueDateString);
							dueDate = new CalendarDate(
								dueLocalDate.year,
								dueLocalDate.month,
								dueLocalDate.day,
							).toString();
							dueTime = new Time(
								dueLocalDate.hour,
								dueLocalDate.minute,
								dueLocalDate.second,
							).toString();
							const startDateString = isQuiz
								? data.assignment.startDate?.replace(" ", "T").concat("Z")
								: undefined;
							if (startDateString) {
								const startLocalDate = parseAbsoluteToLocal(startDateString);
								if (isQuiz) {
									startDate = new CalendarDate(
										startLocalDate.year,
										startLocalDate.month,
										startLocalDate.day,
									).toString();
									startTime = new Time(
										startLocalDate.hour,
										startLocalDate.minute,
										startLocalDate.second,
									).toString();
								}
							}
						} catch (error) {
							console.warn("Failed to parse date:", error);
							dueDate = "";
							dueTime = "23:59:59";
						}
					}
					toast.success("Question added successfully");
				} else if (form.create.message) {
					toast.error(form.create.message);
				} else {
					toast.error("Failed to add question");
				}
			} else if (form.edit) {
				if (form.edit.success) {
					toast.success("Assignment edited successfully");
					invalidateAll().then(() => {
						$formData.title = assignmentData.title;
						$formData.description = assignmentData.description;
						$formData.dueDate = assignmentData.dueDate;
						invalidateAll().then(() => {
							// Force update after data refresh
							const assignment = data.assignment;
							$formData.title = assignment.title;
							$formData.description = assignment.description;
							$formData.dueDate = assignment.dueDate;

							if (assignment.dueDate) {
								try {
									const dateString = assignment.dueDate.replace(" ", "T").concat("Z");
									const localDate = parseAbsoluteToLocal(dateString);
									dueDate = new CalendarDate(
										localDate.year,
										localDate.month,
										localDate.day,
									).toString();
									dueTime = new Time(localDate.hour, localDate.minute, localDate.second).toString();
								} catch (error) {
									console.warn("Failed to parse date:", error);
									dueDate = "";
									dueTime = "23:59:59";
								}
							}
						});
					});
				} else if (form.edit.message) {
					toast.error(form.edit.message);
				} else {
					toast.error("Failed to edit assignment");
				}
			}
		}
	});
	$effect(() => {
		$formData.title = assignmentData.title;
		$formData.description = assignmentData.description;
		$formData.dueDate = assignmentData.dueDate;
		$formData.quiz = isQuiz;
		$formData.limitUser = assignmentData.limitUser || 0;
		if (assignmentData.dueDate) {
			try {
				const dueDateString = data.assignment.dueDate.replace(" ", "T").concat("Z");
				const dueLocalDate = parseAbsoluteToLocal(dueDateString);
				dueDate = new CalendarDate(
					dueLocalDate.year,
					dueLocalDate.month,
					dueLocalDate.day,
				).toString();
				dueTime = new Time(dueLocalDate.hour, dueLocalDate.minute, dueLocalDate.second).toString();
				const startDateString = isQuiz
					? data.assignment.startDate?.replace(" ", "T").concat("Z")
					: undefined;
				if (startDateString) {
					const startLocalDate = parseAbsoluteToLocal(startDateString);
					if (isQuiz) {
						startDate = new CalendarDate(
							startLocalDate.year,
							startLocalDate.month,
							startLocalDate.day,
						).toString();
						startTime = new Time(
							startLocalDate.hour,
							startLocalDate.minute,
							startLocalDate.second,
						).toString();
					}
				}
			} catch (error) {
				console.warn("Failed to parse date:", error);
				dueDate = "";
				dueTime = "23:59:59";
			}
		}
	});

	const dfWithoutTime = Intl.DateTimeFormat(undefined, {
		dateStyle: "full",
	});
	const dfTime = Intl.DateTimeFormat(undefined, {
		dateStyle: "full",
		timeStyle: "short",
	});
</script>

{#if data.user.role === 3}
	<div class="space-y-4">
		<div class="mb-2 space-y-2">
			<div class="mb-2">
				<div class="flex flex-row items-end justify-between gap-2">
					<h1 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
						{data.assignment?.title}
					</h1>
					<Button
						variant="default"
						href="/subject/{page.params.subjectCode}/{page.params.chapter}/assignments/{data
							.assignment.id}/details"
						class="mb-px"
					>
						View Result
					</Button>
				</div>
				<Separator />
			</div>
			<form
				action="?/edit"
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
							<Textarea {...props} bind:value={$formData.description} placeholder="First Learn" />
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
										Bonus quiz can be taken by students to earn extra points but only limited to
										number of students you decide.
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
								<Form.Description
									>Date when students can start taking the assignment.</Form.Description
								>
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
				{#each assignmentAttachment as attachment (attachment)}
					{@const fileCategory = getFileCategory(attachment)}
					{#if fileCategory === "image"}
						<img src="{PUBLIC_R2_URL}/{attachment}" class="size-20" alt="" />
					{:else}
						{@const Icons = getFileIcon(attachment)}
						<a
							href="{PUBLIC_R2_URL}/{attachment}"
							class="flex w-fit flex-row items-center gap-2 rounded-sm border p-2"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icons class="size-5" />
							<span class="text-sm">{attachment}</span>
						</a>
					{/if}
				{/each}
				{#if $errors._errors}
					<FormErrors message={Object.values($errors._errors).join(", ")} />
				{/if}
				<Form.Button class="w-fit">Edit</Form.Button>
			</form>
			<AlertDialog.Root>
				<AlertDialog.Trigger
					type="button"
					class={buttonVariants({ variant: "destructive", outline: true })}
				>
					Delete
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<form class="contents" action="?/delete" method="POST" use:svelteEnhance>
						<AlertDialog.Header>
							<AlertDialog.Title
								>Do you want to delete assignment {data.assignment.title}?</AlertDialog.Title
							>
							<AlertDialog.Description>
								<input type="hidden" name="id" value={data.assignment.id} />
								This action is irreversible. Are you sure you want to delete
								<b>{data.assignment.title}</b>?
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
		<div class="mb-2">
			<div class="flex flex-row items-center justify-between gap-2">
				<h2 class="text-2xl font-medium">Questions</h2>
				<p class="text-sm text-muted-foreground">
					{questionsList.length} question{questionsList.length > 1 ? "s" : ""}
				</p>
			</div>
			<Separator />
		</div>
		{#if role === 3}
			<form
				action="?/addquestion"
				method="POST"
				class="flex flex-col gap-4 sm:gap-2"
				enctype="multipart/form-data"
				use:svelteEnhance
			>
				<Input type="hidden" name="questionAmount" value={questionsList.length} />
				{#each questionsList as question, listIndex (question.key)}
					{@const questionIndex = questionsList.indexOf(question)}
					<div
						class="flex w-full flex-col items-stretch gap-2 sm:flex-row"
						animate:flip={{ duration: 300, easing: cubicOut }}
						transition:slide={{ axis: "y", easing: cubicOut, duration: 300 }}
					>
						<div
							class="flex w-full flex-row items-center justify-between overflow-hidden rounded-xl border bg-card px-0 pb-0 text-center font-display text-lg font-semibold tracking-tight break-all text-card-foreground tabular-nums shadow-sm sm:w-12 sm:flex-col sm:px-2 sm:pb-1.5"
						>
							<p class="w-12 border-r py-2 sm:border-b">
								{listIndex + 1}
							</p>
							<div class="space-y-0 px-2 py-2 sm:py-0">
								<Tooltip.Provider delayDuration={200} disableHoverableContent>
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<Button
													{...props}
													type="button"
													variant="outline"
													size="icon"
													class="rounded-none max-sm:rounded-l-lg sm:rounded-t-lg"
													disabled={listIndex === 0}
													onclick={() => {
														if (listIndex > 0) {
															const temp = questionsList[listIndex];
															questionsList[listIndex] = questionsList[listIndex - 1];
															questionsList[listIndex - 1] = temp;
														}
													}}
												>
													<ArrowUp />
												</Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="right">
											<p>Move Question Up</p>
										</Tooltip.Content>
									</Tooltip.Root>
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<Button
													type="button"
													{...props}
													variant="outline"
													size="icon"
													class="rounded-none max-sm:mr-2 max-sm:rounded-r-lg sm:mb-2 sm:rounded-b-lg"
													disabled={listIndex === questionsList.length - 1}
													onclick={() => {
														if (listIndex < questionsList.length - 1) {
															const temp = questionsList[listIndex];
															questionsList[listIndex] = questionsList[listIndex + 1];
															questionsList[listIndex + 1] = temp;
														}
													}}
												>
													<ArrowDown />
												</Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="right">
											<p>Move Question Down</p>
										</Tooltip.Content>
									</Tooltip.Root>
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<Button
													{...props}
													type="button"
													variant="outline"
													size="icon"
													class="rounded-lg max-sm:mr-2 sm:mb-2"
													onclick={() => {
														const newKey = uuidv4();
														// eslint-disable-next-line @typescript-eslint/no-unused-vars
														const { key, ...rest } = question;
														questionsList.splice(questionIndex + 1, 0, {
															key: newKey,
															...rest,
														});
													}}
												>
													<Copy />
												</Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="right">
											<p>Duplicate Question</p>
										</Tooltip.Content>
									</Tooltip.Root>
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<Button
													{...props}
													type="button"
													variant="outline"
													size="icon"
													class="rounded-lg hover:bg-destructive-muted hover:text-destructive max-sm:border-destructive max-sm:text-destructive max-sm:hover:bg-destructive"
													onclick={() => {
														questionsList.splice(questionIndex, 1);
													}}
												>
													<Trash />
												</Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="right">
											<p>Delete Question</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</Tooltip.Provider>
							</div>
						</div>
						<Card.Root class="grow">
							<Card.Header>
								<Card.Title>
									Question {listIndex + 1}
								</Card.Title>
								<Input
									type="hidden"
									name="question-{listIndex}-type"
									id="question-{listIndex}-type"
									value={question.type}
								/>
								<RadioGroup.Root
									class="flex w-full flex-col gap-4 sm:flex-row sm:gap-6 md:gap-8"
									bind:value={questionsList[questionIndex].type}
									onValueChange={(newValue) => {
										if (newValue === "multiple-choice") {
											if (question.type === "multiple-choice") {
												if (!question.choices) {
													question.choices = [];
													question.correctChoice = "";
												}
											}
										}
									}}
								>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="short-answer" id="short-answer-{listIndex}" />
										<Label for="short-answer-{listIndex}">Short Answer</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="multiple-choice" id="multiple-choice-{listIndex}" />
										<Label for="multiple-choice-{listIndex}">Multiple Choice</Label>
									</div>
								</RadioGroup.Root>
							</Card.Header>
							<Card.Content class="space-y-2">
								<div class="mb-2 flex w-full flex-col gap-1.5">
									<Label for="question-{listIndex}">Question</Label>
									<Input
										type="text"
										name="question-{listIndex}"
										id="question-{listIndex}"
										bind:value={question.question}
										placeholder="Enter question"
										class="mb-2 w-full"
									/>
								</div>
								<div class="grid items-center gap-1.5">
									<Label for="question-{listIndex}-attachment">Attachment</Label>
									<Input
										id="question-{listIndex}-attachment"
										name="question-{listIndex}-attachment"
										type="file"
										accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
										files={question.upload}
										multiple
										onchange={(event) => {
											const target = event?.target as HTMLInputElement | null;
											if (!target || !("files" in target)) return;
											const newFiles = target.files;
											const oldFiles = question.upload ?? new DataTransfer().files;
											const dataTransfer = new DataTransfer();
											for (let i = 0; i < oldFiles.length; i++) {
												dataTransfer.items.add(oldFiles[i]);
											}
											if (newFiles) {
												for (let i = 0; i < newFiles.length; i++) {
													dataTransfer.items.add(newFiles[i]);
												}
											}
											question.upload = dataTransfer.files;
										}}
									/>
								</div>
								{#if question?.upload && question.upload.length > 0}
									{#each question.upload as file (file)}
										{@const Icons = getFileIcon(file.name)}
										<li
											animate:flip={{ duration: 300, easing: cubicOut }}
											transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
											class="flex w-fit flex-row items-center gap-1 truncate rounded-sm border px-2 py-1"
										>
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
																	const filesArray = Array.from(question?.upload ?? []);
																	const filteredFiles = filesArray.filter(
																		(f) => f.name !== file.name,
																	);
																	const dataTransfer = new DataTransfer();
																	filteredFiles.forEach((f) => dataTransfer.items.add(f));
																	question.upload = dataTransfer.files;
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
								{/if}
								{#if question.type === "short-answer"}
									<div class="flex w-full flex-col gap-1.5">
										<Label for="answer-{listIndex}">Answer</Label>
										<Input
											type="text"
											name="answer-{listIndex}"
											id="answer-{listIndex}"
											bind:value={question.answer}
											placeholder="Enter answer"
											class="mb-2 w-full"
										/>
									</div>
								{/if}
								{#if question.type === "multiple-choice"}
									<div class="mb-2 flex w-full flex-col gap-1.5">
										<Label for="answer-{listIndex}">Answer</Label>
										{#each question.choices as choice, childListIndex (choice.key)}
											{@const choiceIndex = question.choices.indexOf(choice)}
											{@const letter = String.fromCharCode(65 + childListIndex)}
											<div
												class="flex items-center justify-center gap-2"
												animate:flip={{ duration: 300, easing: cubicOut }}
												transition:fly={{
													x: 200,
													duration: 300,
													easing: cubicOut,
												}}
											>
												<div
													class="flex h-9 w-4 items-center justify-center rounded-sm border px-4 text-center font-display text-sm font-medium sm:size-9 sm:text-base"
												>
													{letter}
												</div>
												<Input
													type="text"
													name="answer-{listIndex}-choice"
													id="answer-{listIndex}-{childListIndex}"
													bind:value={choice.value}
													placeholder="Enter choice"
													class="w-full"
													oninput={() => (question.answer = choice.value)}
												/>
												<Tooltip.Provider delayDuration={200} disableHoverableContent>
													<Tooltip.Root>
														<Tooltip.Trigger>
															{#snippet child({ props })}
																<Button
																	{...props}
																	type="button"
																	variant="success"
																	size="icon"
																	outline={question.correctChoice !== choice.key}
																	onclick={() => {
																		question.answer = choice.value;
																		question.correctChoice = choice.key;
																	}}
																>
																	<Check />
																</Button>
															{/snippet}
														</Tooltip.Trigger>
														<Tooltip.Content>
															<p>Select as correct answer</p>
														</Tooltip.Content>
													</Tooltip.Root>
													<Tooltip.Root>
														<Tooltip.Trigger>
															{#snippet child({ props })}
																<Button
																	{...props}
																	type="button"
																	variant="outline"
																	size="icon"
																	disabled={childListIndex === 0}
																	onclick={() => {
																		if (childListIndex > 0) {
																			const temp = question.choices[childListIndex];
																			question.choices[childListIndex] =
																				question.choices[childListIndex - 1];
																			question.choices[childListIndex - 1] = temp;
																		}
																	}}
																>
																	<ArrowUp />
																</Button>
															{/snippet}
														</Tooltip.Trigger>
														<Tooltip.Content>
															<p>Move Up</p>
														</Tooltip.Content>
													</Tooltip.Root>
													<Tooltip.Root>
														<Tooltip.Trigger>
															{#snippet child({ props })}
																<Button
																	{...props}
																	type="button"
																	variant="outline"
																	size="icon"
																	disabled={childListIndex === question.choices.length - 1}
																	onclick={() => {
																		if (childListIndex < question.choices.length - 1) {
																			const temp = question.choices[childListIndex];
																			question.choices[childListIndex] =
																				question.choices[childListIndex + 1];
																			question.choices[childListIndex + 1] = temp;
																		}
																	}}
																>
																	<ArrowDown />
																</Button>
															{/snippet}
														</Tooltip.Trigger>
														<Tooltip.Content>
															<p>Move Down</p>
														</Tooltip.Content>
													</Tooltip.Root>
													<Tooltip.Root>
														<Tooltip.Trigger>
															{#snippet child({ props })}
																<Button
																	{...props}
																	type="button"
																	variant="destructive"
																	size="icon"
																	outline
																	onclick={() => {
																		question.choices.splice(choiceIndex, 1);
																	}}
																>
																	<X />
																</Button>
															{/snippet}
														</Tooltip.Trigger>
														<Tooltip.Content>
															<p>Remove Choice</p>
														</Tooltip.Content>
													</Tooltip.Root>
												</Tooltip.Provider>
											</div>
										{/each}
										<Input
											type="hidden"
											name="answer-{listIndex}"
											id="answer-{listIndex}"
											value={question.answer}
										/>
									</div>
									<Button
										type="button"
										variant="outline"
										disabled={question.choices.length >= 5}
										onclick={() => {
											const key = uuidv4();
											question.choices.push({ key: key, value: "" });
											if (!question.correctChoice || question.correctChoice === "") {
												question.correctChoice = key;
											}
											question.answer = "";
										}}
									>
										<Plus />
										Add Choice
									</Button>
								{/if}
							</Card.Content>
						</Card.Root>
					</div>
				{/each}
				<Button
					variant="outline"
					type="button"
					class=""
					onclick={() => {
						const key = uuidv4();
						questionsList.push({
							key,
							type: "short-answer",
							question: "",
							answer: "",
						});
					}}
				>
					<Plus class="" />
					Add Question
				</Button>
				<Button type="submit" variant="default" class="w-fit">Save Changes</Button>
			</form>
		{/if}
	</div>
{:else}
	<div class="flex w-full flex-col justify-between gap-4 sm:gap-8 lg:flex-row">
		<div class="w-full grow">
			<p class="text-sm text-muted-foreground">Assignment</p>
			<div class="space-y-1">
				<h1 class="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
					{data.assignment.title}
				</h1>
				<p class="text-muted-foreground">
					{dfWithoutTime.format(new Date(data.assignment.createdAt))}
				</p>
			</div>
			<Separator />
			<p>{data.assignment.description}</p>
			{#if data.assignment.attachment}
				<ul class="mt-4 flex flex-col gap-2">
					{#each assignmentAttachment as attachment (attachment)}
						{@const fileCategory = getFileCategory(attachment)}
						{#if fileCategory === "image"}
							<img src="{PUBLIC_R2_URL}/{attachment}" class="" alt="" />
						{:else}
							{@const Icons = getFileIcon(attachment)}
							<a
								href="{PUBLIC_R2_URL}/{attachment}"
								class="flex w-fit flex-row items-center gap-2 rounded-sm border p-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Icons class="size-5" />
								<span class="text-sm">{attachment}</span>
							</a>
						{/if}
					{/each}
				</ul>
			{/if}
		</div>

		<Card.Root class="h-fit w-full grow lg:max-w-lg ">
			<Card.Header>
				<Card.Title class="flex flex-row items-center justify-between text-xl tracking-tight">
					Submission
					{#if data.assignment.done === 0}
						<span
							class="text-base {dayjs(data.assignment.dueDate + 'Z').isBefore(dayjs())
								? 'text-destructive'
								: dayjs(data.assignment.dueDate + 'Z').isSame(dayjs().add(1, 'day'), 'day')
									? 'text-warning'
									: ''}"
						>
							{dayjs(data.assignment.dueDate + "Z").fromNow()}
						</span>
					{:else}
						<span class="text-base text-success">Submitted</span>
					{/if}
				</Card.Title>
				<Card.Description>
					Due Date:
					<span class="font-medium text-foreground">
						{dfTime.format(new Date(data.assignment.dueDate + "Z"))}
					</span>
				</Card.Description>
			</Card.Header>
			<Card.Footer class="flex-col gap-2">
				<div class="flex w-full flex-col gap-1 rounded-lg border bg-muted">
					{#if data.questions.length === 0}
						<Alert.Root class="w-full">
							<OctagonAlert />
							<Alert.Title>Assignment doesn't have question yet</Alert.Title>
							<Alert.Description>
								Please contact your teacher for more information.
							</Alert.Description>
						</Alert.Root>
					{:else}
						<p
							class="self-end px-2 pt-1 text-sm font-medium
              {dayjs(data.assignment.dueDate + 'Z').isBefore(dayjs()) || data.assignment.done === 1
								? 'text-muted-foreground'
								: ''}"
						>
							{data.questions.length} question{data.questions.length !== 1 ? "s" : ""}
						</p>
					{/if}
					<Button
						variant="default"
						disabled={dayjs(data.assignment.dueDate + "Z").isBefore(dayjs()) ||
							data.assignment.done === 1 ||
							data.questions.length === 0}
						class="w-full"
						href="/subject/{data.subject.code}/{data.assignment.chapter}/assignments/{data
							.assignment.id}/start"
					>
						Start Assignment
					</Button>
				</div>

				{#if data.assignment.done === 1}
					<Button
						variant="outline"
						class="w-full"
						href="/subject/{data.subject.code}/{data.assignment.chapter}/assignments/{data
							.assignment.id}/result"
					>
						Result/Score
					</Button>
				{/if}
			</Card.Footer>
		</Card.Root>
	</div>
{/if}
