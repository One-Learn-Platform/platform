<script lang="ts">
	import { browser } from "$app/environment";
	import { enhance as svelteEnhance } from "$app/forms";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import { onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import type { ActionData, PageServerData, PageServerParentData } from "./$types";

	import { formSchemaEdit } from "$lib/schema/forum/schema";
	import Dompurify from "dompurify";
	import type { default as Quill } from "quill";
	import { toast } from "svelte-sonner";
	import { superForm, fileProxy } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { formSchema } from "./schema";

	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
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
	import { getFileCategory, getFileIcon } from "$lib/functions/material";

	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import Pencil from "@lucide/svelte/icons/pencil";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Wind from "@lucide/svelte/icons/wind";

	let { data, form }: { data: PageServerData & PageServerParentData; form: ActionData } = $props();

	let dialogForumOpen = $state(false);
	let dialogCommentOpen = $state(false);
	let edit = $state(false);
	let editComment = $state(false);
	let editId: number = $state(-1);

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors: formErrors } = superform;
	const superformEditComment = superForm(data.formEditComment, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
	});
	const {
		form: formDataEditComment,
		enhance: enhanceEditComment,
		errors: formErrorsEditComment,
	} = superform;
	const superformEdit = superForm(data.formEditForum, {
		taintedMessage: null,
		validators: zod4Client(formSchemaEdit),
	});
	const { form: formDataEdit, enhance: enhanceEdit, errors: formErrorsEdit } = superformEdit;
	const attachmentProxy = fileProxy(formDataEdit, "attachment");
	let fileName = $state();

	const initials = acronym(data.forum.fullname ?? "ID");
	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
	const localeDate = $derived(new Date(data.forum.createdAt + "Z"));
	const sanitizedDescription = $derived(
		browser ? Dompurify.sanitize(data.forum.description) : data.forum.description,
	);

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
	let quillInstanceEditComment: Quill | null = null;
	let editorElementEditComment: HTMLElement | undefined = $state();
	$effect(() => {
		if (editComment && editorElementEditComment && !quillInstanceEditComment) {
			const initQuill = async () => {
				try {
					const { default: QuillConstructor } = await import("quill");
					await import("quill/dist/quill.snow.css");
					if (!editorElementEditComment) {
						console.error("Editor element not found");
						return;
					}
					quillInstanceEditComment = new QuillConstructor(editorElementEditComment, {
						theme: "snow",
						placeholder: "Write your content here...",
						modules: {
							toolbar: [
								[{ header: [1, 2, 3, 4, false] }],
								["bold", "italic", "underline"],
								["code-block", "link", "blockquote"],
							],
						},
					});

					quillInstanceEditComment.setContents(
						quillInstanceEditComment.clipboard.convert({
							html: data.comments.find((c) => c.id === editId)?.content || "",
						}),
					);

					quillInstanceEditComment.on("text-change", () => {
						if (quillInstanceEditComment) {
							$formDataEditComment.content = quillInstanceEditComment
								.getSemanticHTML()
								.replaceAll(/((?:&nbsp;)*)&nbsp;/g, "$1 ");
						}
					});
				} catch (error) {
					console.error("Failed to initialize Quill:", error);
				}
			};

			initQuill();
		}
		if (!editComment && quillInstanceEditComment) {
			quillInstanceEditComment = null;
		}
	});
	let quillInstanceEdit: Quill | null = null;
	let editorElementEdit: HTMLElement | undefined = $state();
	$effect(() => {
		if (edit && editorElementEdit && !quillInstanceEdit) {
			const initQuill = async () => {
				try {
					const { default: QuillConstructor } = await import("quill");
					await import("quill/dist/quill.snow.css");
					if (!editorElementEdit) {
						console.error("Editor element not found");
						return;
					}
					quillInstanceEdit = new QuillConstructor(editorElementEdit, {
						theme: "snow",
						placeholder: "Write your content here...",
						modules: {
							toolbar: [
								[{ header: [1, 2, 3, 4, false] }],
								["bold", "italic", "underline"],
								["code-block", "link", "blockquote"],
							],
						},
					});

					quillInstanceEdit.setContents(
						quillInstanceEdit.clipboard.convert({ html: data.forum?.description || "" }),
					);

					quillInstanceEdit.on("text-change", () => {
						if (quillInstanceEdit) {
							$formDataEdit.description = quillInstanceEdit
								.getSemanticHTML()
								.replaceAll(/((?:&nbsp;)*)&nbsp;/g, "$1 ");
						}
					});
				} catch (error) {
					console.error("Failed to initialize Quill:", error);
				}
			};

			initQuill();
		}
		if (!edit && quillInstanceEdit) {
			quillInstanceEdit = null;
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

	$effect(() => {
		if (edit) {
			$formDataEdit.title = data.forum.title;
			$formDataEdit.description = data.forum.description;
		}
	});

	$effect(() => {
		if (form) {
			if (form.comment) {
				if (form.comment.success) {
					toast.success("Comment added successfully");
					invalidateAll();
					quillInstance?.setText("");
				} else {
					toast.error(form.comment.message ?? "Unknown error");
				}
			} else if (form.deleteforum) {
				if (form.deleteforum.success) {
					dialogForumOpen = false;
					toast.success("Forum deleted successfully");
					invalidateAll();
				} else {
					toast.error(form.deleteforum.message ?? "Unknown error");
				}
			} else if (form.deletecomment) {
				if (form.deletecomment.success) {
					dialogCommentOpen = false;
					toast.success("Comment deleted successfully");
					invalidateAll();
				} else {
					toast.error(form.deletecomment.message ?? "Unknown error");
				}
			} else if (form.editforum) {
				if (form.editforum.success) {
					edit = false;
					toast.success("Forum edited successfully");
				} else {
					toast.error(form.editforum.message ?? "Unknown error");
				}
			} else if (form.editcomment) {
				if (form.editcomment.success) {
					editComment = false;
					editId = -1;
					toast.success("Comment edited successfully");
				} else {
					toast.error(form.editcomment.message ?? "Unknown error");
				}
			}
		}
	});
</script>

<svelte:head>
	<title>{data.forum.title} | OneLearn</title>
</svelte:head>

<div>
	<h1 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">View Forum</h1>
	<Separator />
</div>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl tracking-tight sm:text-3xl md:text-4xl">
			{data.forum.title}
			<Separator />
		</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-2">
		{#if edit}
			<form
				action="?/editforum"
				method="POST"
				class="flex w-full grow flex-col gap-2"
				enctype="multipart/form-data"
				use:enhanceEdit
			>
				<Form.Field form={superformEdit} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Title</Form.Label>
							<Input {...props} bind:value={$formDataEdit.title} placeholder="John Doe" />
						{/snippet}
					</Form.Control>
					{#if $formErrorsEdit.title}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Title of the forum</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superformEdit} name="description" class="flex h-fit min-h-1/2 flex-col">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Content</Form.Label>
							<div bind:this={editorElementEdit}></div>
							<input
								{...props}
								type="hidden"
								bind:value={$formDataEdit.description}
								placeholder="Description of the forum"
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrorsEdit.description}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Content of the forum</Form.Description>
					{/if}
				</Form.Field>
				<Form.Field form={superformEdit} name="attachment">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Attachment</Form.Label>
							<Input
								{...props}
								type="file"
								bind:files={$attachmentProxy}
								bind:value={fileName}
								placeholder="Upload your file"
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrorsEdit.attachment}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Attach any file up to 100MB</Form.Description>
					{/if}
				</Form.Field>
				<div class="flex flex-row justify-end gap-2">
					<Button variant="outline" type="button" onclick={() => (edit = false)} size="sm">
						Cancel
					</Button>
					<Form.Button class="self-end" size="sm">Edit</Form.Button>
				</div>
			</form>
		{:else}
			<div class="raw max-w-full **:break-words **:whitespace-break-spaces">
				{@html sanitizedDescription}
			</div>
			<div class="flex w-full flex-row items-center justify-between gap-2">
				{#if data.forum.attachment}
					{@const Icons = getFileIcon(data.forum.attachment)}
					{@const category = getFileCategory(data.forum.attachment)}
					{#if category === "image"}
						<img src="{PUBLIC_R2_URL}/{data.forum.attachment}" alt="" class="max-h-48 max-w-24" />
					{:else}
						<a
							href={`${PUBLIC_R2_URL}/${data.forum.attachment}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icons class="size-4" />
							{data.forum.attachment.split("/").pop()}
						</a>
					{/if}
				{/if}
				<div class="space-x-2">
					{#if data.forum.userId === data.user.id}
						<Button variant="outline" size="sm" onclick={() => (edit = true)}><Pencil />Edit</Button
						>
					{/if}
					{#if data.user.role === 2 || data.forum.userId === data.user.id}
						<AlertDialog.Root bind:open={dialogForumOpen}>
							<AlertDialog.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="destructive" size="sm"><Trash2 />Delete</Button>
								{/snippet}
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<form action="?/deleteforum" method="POST" class="contents" use:svelteEnhance>
									<AlertDialog.Header>
										<AlertDialog.Title>Do you want to delete this forum?</AlertDialog.Title>
										<AlertDialog.Description>
											<input type="hidden" name="forum_id" value={data.forum.id} />
											This will permanently delete the forum and all its comments. Make sure you want
											to do this.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
										<AlertDialog.Action>Continue</AlertDialog.Action>
									</AlertDialog.Footer>
								</form>
							</AlertDialog.Content>
						</AlertDialog.Root>
					{/if}
				</div>
			</div>
		{/if}
	</Card.Content>
	<Separator />
	<Card.Footer class="flex items-center gap-2">
		<Avatar.Root>
			<Avatar.Image src="{PUBLIC_R2_URL}/{data.forum.avatar}" alt={data.forum.fullname} />
			<Avatar.Fallback>{initials}</Avatar.Fallback>
		</Avatar.Root>
		<div
			class="flex w-full flex-col items-start justify-between gap-0 sm:flex-row sm:items-center sm:gap-2"
		>
			<span class="truncate font-medium">
				{data.forum.fullname === data.user.fullname ? "You" : data.forum.fullname}
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
		<div class="flex flex-col justify-between gap-2 sm:flex-row">
			<div class="flex grow flex-row gap-2">
				<Button
					variant="secondary"
					class="grow sm:grow-0"
					onclick={() => (sortOpt = sortOpt === "asc" ? "desc" : "asc")}
				>
					{#if sortOpt === "asc"}
						<ArrowDown />Descending
					{:else}
						<ArrowUp />Ascending
					{/if}
				</Button>
				<Select.Root value={sortBy} type="single" onValueChange={(value) => (sortBy = value)}>
					<Select.Trigger class="grow sm:grow-0">{sortContent}</Select.Trigger>
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
			<div class="flex flex-col items-center gap-2 sm:flex-row">
				<div class="flex w-full flex-row gap-2">
					<Label for="perPage" class="whitespace-nowrap">Comments per page:</Label>
					<Input
						name="perPage"
						id="perPage"
						type="number"
						min="1"
						max={data.commentsCount < 10 ? 10 : data.commentsCount}
						bind:value={perPage}
						class="sm:w-16"
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
					<Card.Content class="space-y-2">
						{#if editComment && editId === comment.id}
							<form
								action="?/editcomment"
								method="POST"
								class="flex h-fit flex-col gap-2"
								use:enhanceEditComment
							>
								<Form.Field form={superformEditComment} name="content" class="flex grow flex-col">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label class="text-2xl font-medium tracking-tight">Comment</Form.Label>
											<div bind:this={editorElementEditComment}></div>
											<Input {...props} type="hidden" bind:value={$formDataEditComment.content} />
										{/snippet}
									</Form.Control>
									{#if $formErrorsEditComment.content}
										<Form.FieldErrors />
									{:else}
										<Form.Description>Write your comment here</Form.Description>
									{/if}
								</Form.Field>
								<Form.Field form={superformEditComment} name="id" class="hidden">
									<Form.Control>
										{#snippet children({ props })}
											<Input {...props} type="hidden" bind:value={$formDataEditComment.id} />
										{/snippet}
									</Form.Control>
								</Form.Field>
								<div class="flex flex-row justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={() => {
											editComment = false;
											editId = -1;
										}}>Cancel</Button
									>
									<Form.Button class="self-end" size="sm">Edit Comment</Form.Button>
								</div>
							</form>
						{:else}
							<div class="raw max-w-full **:break-words **:whitespace-break-spaces">
								{@html sanitizedDescription}
							</div>
							<div class="flex w-full flex-row items-center justify-end gap-2">
								{#if data.forum.userId === data.user.id}
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											editComment = true;
											editId = comment.id;
											$formDataEditComment.id = comment.id;
										}}
									>
										<Pencil />Edit
									</Button>
								{/if}
								{#if data.forum.userId === data.user.id || data.user.role === 2}
									<AlertDialog.Root bind:open={dialogCommentOpen}>
										<AlertDialog.Trigger>
											{#snippet child({ props })}
												<Button {...props} variant="destructive" size="sm"><Trash2 />Delete</Button>
											{/snippet}
										</AlertDialog.Trigger>
										<AlertDialog.Content>
											<form
												action="?/deletecomment"
												method="POST"
												class="contents"
												use:svelteEnhance
											>
												<AlertDialog.Header>
													<AlertDialog.Title>Do you want to delete this comment?</AlertDialog.Title>
													<AlertDialog.Description>
														<input type="hidden" name="comment_id" value={comment.id} />
														This will permanently delete the comment. Make sure you want to do this.
													</AlertDialog.Description>
												</AlertDialog.Header>
												<AlertDialog.Footer>
													<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
													<AlertDialog.Action>Continue</AlertDialog.Action>
												</AlertDialog.Footer>
											</form>
										</AlertDialog.Content>
									</AlertDialog.Root>
								{/if}
							</div>
						{/if}
					</Card.Content>
					<Separator />
					<Card.Footer class="flex flex-row items-center gap-4 sm:gap-2">
						<Avatar.Root>
							<Avatar.Image src="{PUBLIC_R2_URL}/{comment.avatar}" alt={comment.fullname} />
							<Avatar.Fallback>{acronym(comment.fullname ?? "ID")}</Avatar.Fallback>
						</Avatar.Root>
						<div
							class="flex w-full flex-col items-start justify-between gap-0 sm:flex-row sm:items-center sm:gap-2"
						>
							<span class="truncate font-medium">
								{comment.fullname === data.user.fullname ? "You" : comment.fullname}
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
