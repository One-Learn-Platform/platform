<script lang="ts">
	import { browser } from "$app/environment";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import { onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import type { ActionData, PageServerData } from "./$types";

	import Dompurify from "dompurify";
	import type { default as Quill } from "quill";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { formSchema } from "./schema";

	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import { invalidateAll } from "$app/navigation";
	import { acronym } from "$lib/utils";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import Wind from "@lucide/svelte/icons/wind";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors: formErrors } = superform;

	const initials = acronym(data.forum.fullname ?? "ID");
	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
	const localeDate = $derived(new Date(data.forum.createdAt + "Z"));
	const sanitizedDescription = $derived(Dompurify.sanitize(data.forum.description));

	let quillInstance: Quill | null = null;
	let editorElement: HTMLElement | undefined = $state();
	onMount(() => {
		const initQuill = async () => {
			try {
				const { default: QuillConstructor } = await import("quill");
				await import("quill/dist/quill.snow.css");
				if (!editorElement) {
					console.error("Editor element is not defined.");
					return;
				}
				quillInstance = new QuillConstructor(editorElement, {
					theme: "snow",
					placeholder: "Write your comment here...",
					modules: {
						toolbar: [
							[{ header: [1, 2, 3, 4, false] }],
							["bold", "italic", "underline"],
							["code-block", "link", "blockquote"],
						],
					},
				});

				quillInstance.on("text-change", () => {
					if (quillInstance) {
						$formData.content = quillInstance
							.getSemanticHTML()
							.replaceAll(/((?:&nbsp;)*)&nbsp;/g, "$1 ");
					}
				});
			} catch (error) {
				console.error("Failed to initialize Quill:", error);
			}
		};

		initQuill();

		return () => {
			if (quillInstance) {
				quillInstance = null;
			}
		};
	});

	$effect(() => {
		if (form?.comment) {
			if (form.comment.success) {
				toast.success("Comment added successfully");
				invalidateAll();
				quillInstance?.setText("");
			} else {
				toast.error(form.comment.message ?? "Unknown error");
			}
		}
	});

	const sortChoice = [
		{ value: "date", label: "Date" },
		{ value: "user", label: "User" },
	];
	let sortOpt = $state("asc");
	let sortBy = $state("date");
	const sortContent = $derived(
		sortChoice.find((f) => f.value === sortBy)?.label ?? "Select a sort option",
	);
	const sortedComments = $derived.by(() =>
		data.comments.toSorted((a, b) => {
			if (sortBy === "date") {
				if (sortOpt === "asc") {
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				}
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			} else if (sortBy === "name") {
				if (sortOpt === "asc") {
					return a.fullname?.localeCompare(b.fullname ?? "") || 0;
				}
				return b.fullname?.localeCompare(a.fullname ?? "") || 0;
			}
			return 0;
		}),
	);

	let perPage = $state(Number(browser ? (sessionStorage.getItem("forum_perPage") ?? "10") : "10"));
	let currentPage = $state(
		Number(browser ? (sessionStorage.getItem("forum_selectedPage") ?? "1") : "1"),
	);
	const commentGrouped = $derived.by(() => {
		const comments = sortedComments;
		const group = [];

		for (let i = 0; i < comments.length; i += perPage) {
			group.push(comments.slice(i, i + perPage));
		}

		return group;
	});
</script>

<svelte:head>
	<title>{data.forum.title} | OneLearn</title>
</svelte:head>

<h1 class="font-display text-3xl font-semibold tracking-tight">View Forum</h1>
<Separator />

<Card.Root>
	<Card.Header>
		<Card.Title class="text-4xl tracking-tight">{data.forum.title}</Card.Title>
		<Separator />
	</Card.Header>
	<Card.Content>
		<div class="raw max-w-full **:break-words **:whitespace-break-spaces">
			{@html sanitizedDescription}
		</div>
	</Card.Content>
	<Separator />
	<Card.Footer class="flex items-center gap-2">
		<Avatar.Root>
			<Avatar.Image src="{PUBLIC_R2_URL}/{data.forum.avatar}" alt={data.forum.fullname} />
			<Avatar.Fallback>{initials}</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex w-full flex-row items-center justify-between gap-2">
			<span class="truncate font-medium">
				{data.forum.fullname}
			</span>
			<span class="text-sm text-muted-foreground">
				{dateFormatter.format(new Date(localeDate))} | {dayjs(localeDate).fromNow()}
			</span>
		</div>
	</Card.Footer>
</Card.Root>
<Separator />

<form action="?/comment" method="POST" class="flex h-fit flex-col gap-2" use:enhance>
	<Form.Field form={superform} name="content" class="flex grow flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-2xl font-medium tracking-tight">Comment</Form.Label>
				<div bind:this={editorElement}></div>
				<Input {...props} type="hidden" bind:value={$formData.content} />
			{/snippet}
		</Form.Control>
		{#if $formErrors.content}
			<Form.FieldErrors />
		{:else}
			<Form.Description>Write your comment here</Form.Description>
		{/if}
	</Form.Field>
	<Form.Button class="self-end">Comment</Form.Button>
</form>
<Separator />

<div class="flex flex-col gap-4">
	{#if commentGrouped.length === 0}
		<div class="flex flex-col items-center gap-1 self-center">
			<Wind class="size-16  text-muted-foreground lg:size-24 xl:size-32" />
			<p class="pt-2 pb-4 text-muted-foreground">No comments yet.</p>
		</div>
	{:else}
		<div class="flex flex-row justify-between gap-2">
			<div class="flex flex-row gap-2">
				<Button variant="secondary" onclick={() => (sortOpt = sortOpt === "asc" ? "desc" : "asc")}>
					{#if sortOpt === "asc"}
						<ArrowDown />Descending
					{:else}
						<ArrowUp />Ascending
					{/if}
				</Button>
				<Select.Root value={sortBy} type="single" onValueChange={(value) => (sortBy = value)}>
					<Select.Trigger class="">{sortContent}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Sort By</Select.Label>
							{#each sortChoice as option (option.value)}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex flex-row items-center gap-2">
				<div class="flex flex-row gap-2">
					<Label for="perPage">Comments per page:</Label>
					<Input
						name="perPage"
						id="perPage"
						type="number"
						min="1"
						max={data.commentsCount < 10 ? 10 : data.commentsCount}
						bind:value={perPage}
						class="w-16"
						oninput={() => sessionStorage.setItem("forum_perPage", perPage.toString())}
					/>
				</div>
				<Pagination.Root
					count={data.commentsCount}
					{perPage}
					bind:page={currentPage}
					class="mx-0 w-fit"
					onPageChange={(page) => {
						sessionStorage.setItem("forum_selectedPage", page.toString());
					}}
				>
					{#snippet children({ pages, currentPage })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton />
							</Pagination.Item>
							{#each pages as page (page.key)}
								{#if page.type === "ellipsis"}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link {page} isActive={currentPage === page.value}>
											{page.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</div>
		</div>
		{#each commentGrouped[currentPage - 1] as comment (comment.id)}
			{@const sanitizedDescription = browser
				? Dompurify.sanitize(comment.content)
				: comment.content}
			<div animate:flip={{ duration: 200, easing: cubicOut }}>
				<Card.Root class="">
					<Card.Content>
						<div class="raw max-w-full **:break-words **:whitespace-break-spaces">
							{@html sanitizedDescription}
						</div>
					</Card.Content>
					<Separator />
					<Card.Footer class="flex items-center gap-2">
						<Avatar.Root>
							<Avatar.Image src="{PUBLIC_R2_URL}/{comment.avatar}" alt={comment.fullname} />
							<Avatar.Fallback>{acronym(comment.fullname ?? "ID")}</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex w-full flex-row items-center justify-between gap-2">
							<span class="truncate font-medium">
								{comment.fullname}
							</span>
							<span class="text-sm text-muted-foreground">
								{dateFormatter.format(new Date(comment.createdAt + "Z"))} | {dayjs(
									comment.createdAt + "Z",
								).fromNow()}
							</span>
						</div>
					</Card.Footer>
				</Card.Root>
			</div>
		{/each}
		<p class="text-sm text-muted-foreground">
			page {currentPage} of {Math.ceil(data.commentsCount / perPage)} from {data.commentsCount} data
		</p>
	{/if}
</div>

<style>
	@reference "tailwindcss";
	:global(.raw h1) {
		@apply text-3xl font-semibold tracking-tight;
	}
	:global(.raw h2) {
		@apply text-2xl font-semibold tracking-tight;
	}
	:global(.raw h3) {
		@apply text-xl font-semibold tracking-tight;
	}
	:global(.raw h4) {
		@apply text-lg font-semibold tracking-tight;
	}
	:global(.raw p) {
		@apply text-base;
	}
</style>
