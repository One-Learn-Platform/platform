<script lang="ts">
	import { browser } from "$app/environment";
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	import type { ActionData, PageData } from "./$types";
	dayjs.extend(relativeTime);

	import Material from "$lib/components/cards/material.svelte";
	import Forum from "$lib/components/page/forum.svelte";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import * as Alert from "$lib/components/ui/alert/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import Edit from "@lucide/svelte/icons/edit";
	import ListTodo from "@lucide/svelte/icons/list-todo";
	import OctagonAlert from "@lucide/svelte/icons/octagon-alert";
	import Plus from "@lucide/svelte/icons/plus";
	import SendHorizontal from "@lucide/svelte/icons/send-horizontal";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";
	import { QuestionType } from "$lib/types/assignment";
	import DOMpurify from "dompurify";
	import { toast } from "svelte-sonner";

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const firstMaterial = $derived(data.material[0]);
	const firstMaterialAttachment = $derived(firstMaterial?.attachment);
	const otherMaterials = $derived(data.material.slice(1));
	const unfinishedAssignments = $derived(data.assignment.filter((a) => a.done === 0));

	const assignmentsDueInWeek = $derived(
		unfinishedAssignments.filter((assignment) =>
			dayjs(assignment.dueDate + "Z").isSame(dayjs().add(1, "week"), "week"),
		),
	);
	const assignmentsDueTomorrow = $derived(
		unfinishedAssignments.filter((assignment) =>
			dayjs(assignment.dueDate + "Z").isSame(dayjs().add(1, "day"), "day"),
		),
	);
	let dialogSubmitOpen = $state(false);
	let dialogQuizOpen = $state(false);
	$effect(() => {
		if (data.quiz) {
			dialogQuizOpen = true;
		}
	});

	let showError = $state(false);
	let currentQuestion = $state(0);
	const questionAmount = $derived(data.questions?.length ?? 0);
	const answer = $state(
		data.questions?.map((question, index) => ({
			id: question.id,
			number: index + 1,
			key: `question-${index}`,
			answer: "",
		})) ?? [],
	);
	const unansweredQuestions = $derived.by(() => answer.filter((a) => a.answer === ""));
	$effect(() => {
		if (unansweredQuestions.length === 0) {
			showError = false;
		}
	});
	$effect(() => {
		if (form?.submit?.success) {
			toast.success("Your answers have been submitted successfully.");
			dialogSubmitOpen = false;
			currentQuestion = 0;
		} else if (form?.submit?.message) {
			dialogSubmitOpen = false;
			toast.error(form.submit.message);
		}
	});
</script>

<section class="flex h-fit flex-col space-y-2">
	{#if data.user.role === 4 && data.quiz && data.questions}
		<Dialog.Root bind:open={dialogQuizOpen}>
			<Dialog.Content class="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
				<Dialog.Header>
					<Dialog.Title>Quick Quiz</Dialog.Title>
					<Dialog.Description>
						Answer the following quiz to get bonus grade. Limited to first {data.quiz.limitUser} student(s).
					</Dialog.Description>
				</Dialog.Header>
				<section class="flex h-full w-full flex-col items-center justify-between gap-2">
					<div class="flex flex-col items-center text-center">
						<p class="w-fit rounded-sm border px-2 py-1 text-sm font-medium tracking-tight">
							{currentQuestion + 1}
							<span class="font-normal text-muted-foreground">of {questionAmount}</span>
						</p>
						<h2 class="text-4xl font-semibold tracking-tight">
							{data.questions[currentQuestion].question}
						</h2>
					</div>

					<div class="flex w-full flex-col items-center justify-center gap-1 px-2 py-4 md:px-12">
						{#if data.questions[currentQuestion].attachment}
							{@const attachment = JSON.parse(data.questions[currentQuestion].attachment!)}
							{#each attachment as file (file)}
								{@const fileCategory = getFileCategory(file.name)}
								{#if fileCategory === "image"}
									<img
										src="{PUBLIC_R2_URL}/{file.url}"
										alt={file.name}
										class="max-w-xs rounded-md"
									/>
								{:else}
									{@const FileIcon = getFileIcon(file.name)}
									<a
										href="{PUBLIC_R2_URL}/{file.url}"
										class="flex w-full max-w-xs flex-row items-center gap-2 rounded-md border p-2 hover:bg-muted"
										target="_blank"
										rel="noopener noreferrer"
									>
										<FileIcon class="" />
										<span class="text-sm">{file.name}</span>
									</a>
								{/if}
							{/each}
						{/if}

						{#if data.questions[currentQuestion].questionType === QuestionType.MULTIPLE_CHOICE && data.questions[currentQuestion].choice}
							{@const choices = JSON.parse(data.questions[currentQuestion].choice!) as string[]}
							<RadioGroup.Root
								class="flex w-full flex-col gap-4 py-4 md:flex-row"
								bind:value={answer[currentQuestion].answer}
							>
								{#each choices as choice, index (choice)}
									<Label
										for={`q-${currentQuestion}-option-${index}`}
										class="flex min-h-24 grow flex-col items-center justify-around rounded-sm border p-4 duration-150 ease-out hover:bg-muted"
									>
										<RadioGroup.Item value={choice} id={`q-${currentQuestion}-option-${index}`} />
										<span class="leading-normal break-words">
											{choice}
										</span>
									</Label>
								{/each}
							</RadioGroup.Root>
						{:else if data.questions[currentQuestion].questionType === QuestionType.SHORT_ANSWER}
							<Label for={`question-${currentQuestion}`} class="w-full">Answer</Label>
							<Input
								type="text"
								name={`question-${currentQuestion}`}
								bind:value={answer[currentQuestion].answer}
								placeholder="Type your answer here..."
								class="w-full"
								autocomplete="off"
							/>
						{/if}
					</div>

					<Alert.Root
						variant="destructive"
						class="border-destructive transition duration-150 ease-out sm:hidden
            {showError ? 'visible opacity-100' : 'invisible opacity-0'} "
					>
						<OctagonAlert />
						<Alert.Title>Please fill out all questions</Alert.Title>
					</Alert.Root>
					<div class="flex w-full flex-row items-end justify-between gap-2">
						<Button
							variant="outline"
							type="button"
							size="default"
							class="h-full min-h-10 text-sm"
							disabled={currentQuestion === 0}
							onclick={() => (currentQuestion = currentQuestion - 1)}
						>
							<ArrowLeft />
							Previous
						</Button>
						<Alert.Root
							variant="destructive"
							class="border-destructive transition duration-150 ease-out max-sm:hidden
              {showError ? 'visible opacity-100' : 'invisible opacity-0'}"
						>
							<OctagonAlert />
							<Alert.Title>Please fill out all questions</Alert.Title>
						</Alert.Root>
						{#if currentQuestion !== questionAmount - 1}
							<Button
								variant="outline"
								type="button"
								size="default"
								class="h-full min-h-10 text-sm"
								disabled={currentQuestion === questionAmount - 1}
								onclick={() => (currentQuestion = currentQuestion + 1)}
							>
								Next
								<ArrowRight />
							</Button>
						{:else}
							<AlertDialog.Root bind:open={dialogSubmitOpen}>
								<AlertDialog.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="default"
											size="default"
											class="h-full min-h-10 text-sm"
											onclick={() => {
												if (unansweredQuestions.length > 0) {
													showError = true;
													toast.error(`Please answer all questions before submitting.`);
												} else {
													dialogSubmitOpen = true;
												}
											}}
										>
											Submit
											<SendHorizontal />
										</Button>
									{/snippet}
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<form action="?/submit" method="POST" class="contents" use:enhance>
										<AlertDialog.Header>
											<AlertDialog.Title>Are you sure you want to submit?</AlertDialog.Title>
											<AlertDialog.Description>
												<input type="hidden" name="quiz_id" value={data.quiz.id} />
												{#each answer as answer (answer.id)}
													<input type="hidden" name={`q-${answer.id}`} bind:value={answer.answer} />
												{/each}
												The answers you provided will be submitted and cannot be changed afterwards. You
												will see your score directly after submitting.
											</AlertDialog.Description>
										</AlertDialog.Header>
										<AlertDialog.Footer>
											<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
											<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
										</AlertDialog.Footer>
									</form>
								</AlertDialog.Content>
							</AlertDialog.Root>
						{/if}
					</div>
				</section>
			</Dialog.Content>
		</Dialog.Root>
	{/if}

	{#if data.user.role === 4}
		{#if assignmentsDueTomorrow.length > 0}
			<Alert.Root variant="destructive" fill="muted">
				<ListTodo />
				<Alert.Title>You have {assignmentsDueTomorrow.length} assignment due tomorrow!</Alert.Title>
				<Alert.Description>Please complete assignments immediately</Alert.Description>
			</Alert.Root>
		{:else if assignmentsDueInWeek.length > 0}
			<Alert.Root variant="warning" fill="muted">
				<ListTodo />
				<Alert.Title>You have {assignmentsDueInWeek.length} assignment(s) due tomorrow</Alert.Title>
				<Alert.Description>Please complete all assignments before the due date</Alert.Description>
			</Alert.Root>
		{:else if unfinishedAssignments.length > 0}
			<Alert.Root variant="informative" fill="muted">
				<ListTodo />
				<Alert.Title>You have unfinished assignments</Alert.Title>
				<Alert.Description>Please complete all assignments before due date</Alert.Description>
			</Alert.Root>
		{/if}
	{/if}

	<div class="mb-0">
		<div class="flex flex-row items-center justify-between">
			<h2 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Material</h2>
			<Button variant="link" href="{page.url.pathname}/material">See All Materials</Button>
		</div>
	</div>
	<Separator />

	{#if firstMaterial}
		{@const sanitizedContent = browser
			? DOMpurify.sanitize(firstMaterial.content)
			: firstMaterial.content}

		<div class="space-y-1">
			<div>
				<Button
					variant="link"
					href="{page.url.pathname}/material/{firstMaterial.id}"
					class="p-0 text-2xl font-medium tracking-tight"
				>
					{firstMaterial.title}
				</Button>
				<Separator />
			</div>
			<p class="text-sm text-muted-foreground">{firstMaterial.description}</p>

			<div class="raw">
				{@html sanitizedContent}
			</div>

			{#if firstMaterialAttachment}
				{@const fileCategory = getFileCategory(firstMaterialAttachment)}
				{@const fileName = firstMaterialAttachment.split("/").pop() || firstMaterialAttachment}
				<p class="text-sm text-muted-foreground">Attachments:</p>
				<div class="flex flex-row flex-wrap items-start gap-2">
					{#if fileCategory === "image"}
						<img
							src="{PUBLIC_R2_URL}/{firstMaterialAttachment}"
							alt=""
							class="h-auto w-1/5 max-w-full min-w-xs"
						/>
					{:else}
						{@const FileIcon = getFileIcon(fileCategory)}
						<a
							href="{PUBLIC_R2_URL}/{firstMaterialAttachment}"
							target="_blank"
							class="group flex h-fit max-w-28 flex-col items-center gap-1 rounded-xs border p-2"
						>
							<FileIcon class="" />
							<span class="leading-tight break-all text-informative group-hover:underline">
								{fileName}
							</span>
						</a>
					{/if}
				</div>
			{:else}
				<p>No attachments available.</p>
			{/if}
		</div>
		{#if data.user.role === 3}
			<Button
				variant="outline"
				class="w-fit"
				href="{page.url.pathname}/material/{firstMaterial.id}/edit"
			>
				<Edit class="" /> Edit
			</Button>
		{/if}
	{/if}
	{#if data.user.role === 3}
		<Button variant="default" class="w-fit" href="{page.url.pathname}/material/create">
			<Plus class="" /> Add Material
		</Button>
	{/if}
	{#if otherMaterials.length !== 0}
		<p>Other material:</p>
		{#each otherMaterials as material (material.id)}
			<Material {material} />
		{/each}
	{/if}
</section>

<section class="mt-4 h-fit space-y-2">
	<div class="mb-0">
		<div class="flex flex-row items-center justify-between">
			<h2 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Assignment</h2>
			<Button variant="link" href="{page.url.pathname}/assignments">See All Assignments</Button>
		</div>
	</div>
	<Separator />
	{#if data.user.role === 3}
		<Button variant="default" class="w-fit" href="{page.url.pathname}/assignments/create">
			<Plus class="" /> Add Assignment
		</Button>
	{/if}
	{#if unfinishedAssignments && unfinishedAssignments.length > 0}
		<ul class="space-y-2">
			{#each unfinishedAssignments as assignment (assignment.id)}
				<li>
					<Button
						variant="outline"
						href="{page.url.pathname}/assignments/{assignment.id}"
						class="h-fit max-h-32 w-full flex-col items-start gap-1 text-left text-xl font-semibold tracking-tight"
					>
						{assignment.title}
						<span
							class="overflow-hidden text-sm font-normal tracking-normal text-ellipsis whitespace-normal text-muted-foreground"
							>{assignment.description}</span
						>
					</Button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No assignments available.</p>
	{/if}
</section>

<section class="mt-4 h-dvh space-y-2">
	<Forum forumList={data.forum} />
</section>
