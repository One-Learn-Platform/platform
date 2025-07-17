<script lang="ts">
	import { QuestionType } from "$lib/types/assignment";
	import type { PageServerData } from "./$types.js";

	import { columns } from "./column";
	import DataTable from "./data-table.svelte";

	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";

	let { data }: { data: PageServerData } = $props();
</script>

<h1 class="text-2xl font-semibold">Assignment Result</h1>
<Tabs.Root value="result" class="w-full">
	<Tabs.List class="w-full">
		<Tabs.Trigger value="result">Result</Tabs.Trigger>
		<Tabs.Trigger value="question">Question</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="result" class="space-y-2">
		<DataTable data={data.userList} {columns} />
	</Tabs.Content>
	<Tabs.Content value="question">
		<div class="flex flex-col gap-4">
			{#each data.questionList as question (question.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-xl sm:text-2xl">{question.question}</Card.Title>
						<Card.Description class="text-base font-normal text-foreground">
							{question.questionType}
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
	</Tabs.Content>
</Tabs.Root>
