<script lang="ts">
	import type { PageServerData } from "./$types";

	import { QuestionType, type SubmissionContent } from "$lib/types/assignment";

	import * as Alert from "$lib/components/ui/alert/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import EyeOff from "@lucide/svelte/icons/eye-off";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";

	let { data }: { data: PageServerData } = $props();
</script>

<section class="grid grid-cols-1 place-items-center rounded-xl border px-2 py-2 md:grid-cols-3">
	<Button
		variant="outline"
		href={`/subject/${data.params.subjectCode}/${data.params.chapter}/assignments/${data.assignment?.id}`}
		class="place-self-stretch sm:place-self-start"
	>
		<ChevronLeft />Back to Assignment
	</Button>
	<div class="w-full space-y-1 sm:w-fit">
		<h1
			class="text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
		>
			Score
		</h1>
		<p
			class="w-full rounded-lg border px-2 py-1 text-center font-mono text-xl tracking-tight text-muted-foreground sm:text-2xl"
		>
			<span class="font-black text-foreground">{data.submission.score}</span>/100
		</p>
	</div>
</section>
<section class="flex w-full grow flex-col justify-center gap-2">
	{#if new Date(data.assignment?.dueDate + "Z") < new Date()}
		{@const userAnswer = JSON.parse(data.submission.content) as SubmissionContent}
		<div>
			<h2 class="font-display text-2xl font-medium tracking-tight sm:text-3xl">Answers</h2>
			<Separator />
		</div>
		<div class="flex flex-col gap-4">
			{#each data.questions as question (question.id)}
				{@const isUserCorrect = question.answer === userAnswer[question.id]}
				<Card.Root class={isUserCorrect ? "border-success" : "border-destructive"}>
					<Card.Header>
						<Card.Title class="text-xl sm:text-2xl">{question.question}</Card.Title>
						<Card.Description class="text-base font-normal text-foreground">
							Your answer: <span
								class="rounded-sm border px-2 py-1 {isUserCorrect
									? 'border-success bg-success-muted'
									: 'border-destructive bg-destructive-muted'}">{userAnswer[question.id]}</span
							>
						</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if question.questionType === QuestionType.MULTIPLE_CHOICE && question.choice}
							{@const choices = JSON.parse(question.choice!) as string[]}
							<div class="flex flex-col gap-2">
								<p class="font-medium">Choice:</p>
								{#each choices as choice, index (choice)}
									{@const letter = String.fromCharCode(65 + index)}
									{@const isCorrect = question.answer.includes(choice)}
									<div class="flex items-center gap-1">
										<div
											class="flex h-9 w-4 items-center justify-center rounded-sm border px-2 text-center font-display text-sm font-medium sm:size-9 sm:text-base
                    {isCorrect
												? 'border-success bg-success-muted'
												: 'border-destructive bg-destructive-muted'}"
										>
											{letter}
										</div>
										<div
											class="flex h-fit min-h-9 items-center justify-start rounded-sm border px-2 text-left text-sm font-medium sm:text-base
                    {isCorrect
												? 'border-success bg-success-muted font-semibold'
												: 'border-destructive bg-destructive-muted font-normal'}"
										>
											{choice}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="font-medium">Answer:</p>
							<div
								class="flex h-fit min-h-9 items-center justify-start rounded-sm border px-2 text-left text-sm font-medium sm:text-base"
							>
								{question.answer}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<Alert.Root class="mb-4 w-fit self-center">
			<EyeOff />
			<Alert.Title class="line-clamp-0 whitespace-break-spaces">
				All answers will be available to see after the due date of this assignment.<br />
			</Alert.Title>
			<Alert.Description
				>Due Date: {new Date(data.assignment?.dueDate + "Z").toLocaleString(undefined, {
					dateStyle: "long",
					timeStyle: "short",
				})}</Alert.Description
			>
		</Alert.Root>
	{/if}
</section>
