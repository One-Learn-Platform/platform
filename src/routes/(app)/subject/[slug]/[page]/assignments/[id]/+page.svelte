<script lang="ts">
	import { enhance } from "$app/forms";
	import { untrack } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { fly, slide } from "svelte/transition";
	import type { ActionData, PageServerData } from "./$types";
	import { PUBLIC_R2_URL } from "$env/static/public";

	import type { Question } from "$lib/types/assignment";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import Check from "@lucide/svelte/icons/check";
	import Copy from "@lucide/svelte/icons/copy";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash from "@lucide/svelte/icons/trash";
	import X from "@lucide/svelte/icons/x";
	import { toast } from "svelte-sonner";
	import { v4 as uuidv4 } from "uuid";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import { getFileIcon } from "$lib/functions/material";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const assignmentAttachment = $derived(JSON.parse(data.assignment?.attachment)) as string[];

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
			if (form?.create?.success) {
				toast.success("Question added successfully");
			} else {
				if (form?.create.message) {
					toast.error(form.create.message);
				} else {
					toast.error("Failed to add question");
				}
			}
		}
	});
</script>

<div class="space-y-4">
	<div class="mb-2">
		<h1 class="text-2xl font-medium">{data.assignment?.title}</h1>
		<p>{data.assignment?.description}</p>
		{#each assignmentAttachment as attachment (attachment)}
			<img src="{PUBLIC_R2_URL}/{attachment}" class="size-20" alt="" />
		{/each}
		<Separator />
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
	<form
		action="?/addquestion"
		method="POST"
		class="flex flex-col gap-2"
		enctype="multipart/form-data"
		use:enhance
	>
		<Input type="hidden" name="questionAmount" value={questionsList.length} />
		{#each questionsList as question, listIndex (question.key)}
			{@const questionIndex = questionsList.indexOf(question)}
			<div
				class="flex w-full flex-row items-stretch gap-2"
				animate:flip={{ duration: 300, easing: cubicOut }}
				transition:slide={{ axis: "y", easing: cubicOut, duration: 300 }}
			>
				<div
					class="hidden w-12 flex-col items-center justify-between overflow-hidden rounded-xl border bg-card px-2 pb-1.5 text-center font-display text-lg font-semibold tracking-tight break-all text-card-foreground tabular-nums shadow-sm sm:flex"
				>
					<p class="w-12 border-b py-2">
						{listIndex + 1}
					</p>
					<div class="space-y-0">
						<Tooltip.Provider delayDuration={200} disableHoverableContent>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											type="button"
											variant="outline"
											size="icon"
											class="rounded-none rounded-t-lg"
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
											class="mb-2 rounded-none rounded-b-lg"
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
											class="mb-2 rounded-lg"
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
											class="rounded-lg hover:bg-destructive-muted hover:text-destructive"
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
							class="flex w-full flex-row gap-8"
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
								<RadioGroup.Item value="long-answer" id="long-answer-{listIndex}" />
								<Label for="long-answer-{listIndex}">Long Answer</Label>
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
						{#if question.type === "long-answer"}
							<div class="flex w-full flex-col gap-1.5">
								<Label for="answer-{listIndex}">Answer</Label>
								<Textarea
									name="answer-{listIndex}"
									id="answer-{listIndex}"
									placeholder="Enter answer"
									bind:value={question.answer}
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
											class="flex size-9 items-center justify-center rounded-sm border px-4 text-center font-display font-medium"
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
									if (question.correctChoice === "") {
										question.correctChoice = key;
									}
									question.answer = "";
								}}
							>
								<Plus />
								Add Choice
							</Button>
						{/if}
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
															const filteredFiles = filesArray.filter((f) => f.name !== file.name);
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
</div>
