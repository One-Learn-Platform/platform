<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageServerData } from "./$types";
	import { enhance } from "$app/forms";

	import { QuestionType } from "$lib/types/assignment";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import * as Alert from "$lib/components/ui/alert/index.js";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";

	import { toast } from "svelte-sonner";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import SendHorizontal from "@lucide/svelte/icons/send-horizontal";
	import OctagonAlert from "@lucide/svelte/icons/octagon-alert";

	let { data }: { data: PageServerData } = $props();
	let dialogOpen = $state(false);
	let showError = $state(false);

	let currentQuestion = $state(0);
	const questionAmount = $derived(data.questions.length);
	const answer = $state(
		data.questions.map((question, index) => ({
			id: question.id,
			number: index + 1,
			key: `question-${index}`,
			answer: "",
		})),
	);
	const unansweredQuestions = $derived.by(() => answer.filter((a) => a.answer === ""));
	$effect(() => {
		if (unansweredQuestions.length === 0) {
			showError = false;
		}
	});
</script>

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

	<div class="flex w-full flex-col items-center justify-center gap-1 px-2 md:px-12">
		{#if data.questions[currentQuestion].attachment}
			{@const attachment = JSON.parse(data.questions[currentQuestion].attachment!)}
			{#each attachment as file (file)}
				{@const fileCategory = getFileCategory(file.name)}
				{#if fileCategory === "image"}
					<img src="{PUBLIC_R2_URL}/{file.url}" alt={file.name} class="max-w-xs rounded-md" />
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
			<RadioGroup.Root class="flex flex-row gap-4" bind:value={answer[currentQuestion].answer}>
				{#each choices as choice, index (choice)}
					<Label
						for={`q-${currentQuestion}-option-${index}`}
						class="flex flex-col rounded-sm border p-2 duration-150 ease-out hover:bg-muted"
					>
						<RadioGroup.Item value={choice} id={`q-${currentQuestion}-option-${index}`} />
						<span class="leading-normal">
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

	<div class="flex w-full flex-row items-end justify-between gap-2">
		<Button
			variant="outline"
			size="lg"
			class="h-full min-h-10 text-base"
			disabled={currentQuestion === 0}
			onclick={() => (currentQuestion = currentQuestion - 1)}
		>
			<ArrowLeft />
			Previous
		</Button>
		<Alert.Root
			variant="destructive"
			class="
      border-destructive transition duration-150 ease-out
      {showError ? 'visible opacity-100' : 'invisible opacity-0'} 
      "
		>
			<OctagonAlert />
			<Alert.Title>Please fill out all questions</Alert.Title>
			<Alert.Description>
				Question {unansweredQuestions.map((q) => q.number).join(", ")} is not answered yet.
			</Alert.Description>
		</Alert.Root>
		{#if currentQuestion !== questionAmount - 1}
			<Button
				variant="outline"
				size="lg"
				class="h-full min-h-10 text-base"
				disabled={currentQuestion === questionAmount - 1}
				onclick={() => (currentQuestion = currentQuestion + 1)}
			>
				Next
				<ArrowRight />
			</Button>
		{:else}
			<AlertDialog.Root bind:open={dialogOpen}>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="default"
							size="lg"
							class="h-full min-h-10 text-base"
							onclick={() => {
								if (unansweredQuestions.length > 0) {
									showError = true;
									toast.error(`Please answer all questions before submitting.`);
								} else {
									dialogOpen = true;
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
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								{#each answer as answer (answer.id)}
									<input type="hidden" name={`q-${answer.id}`} bind:value={answer.answer} />
								{/each}
								This action cannot be undone. This will permanently delete your account and remove your
								data from our servers.
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
