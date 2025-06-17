<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import { onMount } from "svelte";
	import type { PageServerData, ActionData } from "./$types";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	import Dompurify from "dompurify";
	import type { default as Quill } from "quill";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { formSchema } from "./schema";
	import { toast } from "svelte-sonner";

	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";

	import { acronym } from "$lib/utils";
	import { invalidateAll } from "$app/navigation";

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
						$formData.content = quillInstance.getSemanticHTML();
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

	function goToPage(pageNum: number) {
		const url = new URL(page.url);
		url.searchParams.set("page", pageNum.toString());
		goto(url.toString());
	}

	function nextPage() {
		if (data.pagination.hasNextPage) {
			goToPage(data.pagination.currentPage + 1);
		}
	}

	function prevPage() {
		if (data.pagination.hasPrevPage) {
			goToPage(data.pagination.currentPage - 1);
		}
	}
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
			{@html Dompurify.sanitize(data.forum.description)}
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

{#if data.pagination.totalPages > 1}
	<div class="pagination mt-6 flex items-center justify-center gap-2">
		<button
			onclick={prevPage}
			disabled={!data.pagination.hasPrevPage}
			class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
		>
			Previous
		</button>

		{#each Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1) as page (page)}
			<button
				onclick={() => goToPage(page)}
				class="rounded border px-3 py-1"
				class:bg-blue-500={data.pagination.currentPage === page}
				class:text-white={data.pagination.currentPage === page}
			>
				{page}
			</button>
		{/each}

		<button
			onclick={nextPage}
			disabled={!data.pagination.hasNextPage}
			class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
		>
			Next
		</button>
	</div>

	<p class="mt-2 text-center text-sm text-gray-500">
		Page {data.pagination.currentPage} of {data.pagination.totalPages}
		({data.pagination.totalComments} total comments)
	</p>
{/if}

<Pagination.Root count={data.pagination.totalPages} perPage={data.pagination.limit}>
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
						<Pagination.Link {page} isActive={currentPage === data.pagination.currentPage}>
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

{#each data.comments as comment (comment.id)}
	<Card.Root class="">
		<Card.Content>
			<div class="raw max-w-full **:break-words **:whitespace-break-spaces">
				{@html Dompurify.sanitize(comment.content)}
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
{/each}

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
