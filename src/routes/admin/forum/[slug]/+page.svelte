<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";

	import { formSchemaEdit } from "$lib/schema/forum/schema";
	import { clsx } from "clsx";
	import type { default as Quill } from "quill";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

	let { data, form }: PageProps = $props();

	const forumDetail = $derived(data.forumData);

	let changes = $state({
		title: false,
		description: false,
	});
	const isChanged = $derived(changes);
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaEdit),
		id: "edit",
		onChange(event) {
			if (event) {
				if (event.paths.includes("title")) {
					if ($formData.title !== forumDetail.title) {
						changes.title = true;
					} else {
						changes.title = false;
					}
				}
				if (event.paths.includes("description")) {
					if ($formData.description !== forumDetail.description) {
						changes.description = true;
					} else {
						changes.description = false;
					}
				}
			}
		},
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;

	$effect(() => {
		$formData.title = forumDetail.title;
		$formData.description = forumDetail.description?.toString() ?? "";
	});

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		} else if (form?.edit) {
			if (form.edit.success) {
				invalidateAll();
				toast.success(`Subject ${form.edit.data?.name} edited successfully`);
			} else toast.error(form.edit.message ?? "Unknown error");
		}
	});

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
					placeholder: "Write your content here...",
					modules: {
						toolbar: [
							[{ header: [1, 2, 3, 4, false] }],
							["bold", "italic", "underline"],
							["code-block", "link", "blockquote"],
						],
					},
				});
				quillInstance.setContents(quillInstance.clipboard.convert({ html: $formData.description }));
				quillInstance.on("text-change", () => {
					if (quillInstance) {
						$formData.description = quillInstance.getSemanticHTML();
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
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">Subject Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit Subject</Card.Title>
		</Card.Header>
		<form
			method="POST"
			action="?/edit{page.url.searchParams.get('ref')
				? '&ref=' + page.url.searchParams.get('ref')
				: ''}"
			class="space-y-2"
			use:enhance
		>
			<Card.Content class="space-y-2">
				<Form.Field form={superform} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Forum Title</Form.Label>
							<Input
								{...props}
								bind:value={$formData.title}
								class={changes.title ? changesClass : ""}
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrors.title}
						<Form.FieldErrors />
					{:else}
						<Form.Description
							>This is the Forum Title that will be available to choose.
						</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Forum Description</Form.Label>
							<div bind:this={editorElement}></div>
							<Input {...props} type="hidden" bind:value={$formData.description} />
						{/snippet}
					</Form.Control>
					{#if $formErrors.description}
						<Form.FieldErrors />
					{:else}
						<Form.Description
							>This is the Forum Description that will be available to choose.
						</Form.Description>
					{/if}
				</Form.Field>
			</Card.Content>

			<Card.Footer class="justify-end gap-4">
				{#if $formErrors._errors}
					<div
						class="flex max-w-md items-center gap-2 rounded-md bg-destructive/5 p-2 text-sm text-destructive"
					>
						<TriangleAlert strokeWidth={1.5} class="min-w-fit" />
						<p>{Object.values($formErrors._errors).join(", ")}</p>
					</div>
				{/if}
				<Button
					variant="outline"
					type="button"
					disabled={!isChanged}
					onclick={() => {
						reset({
							data: {
								title: forumDetail.title ?? "",
								description: forumDetail.description ?? "",
							},
						});
						changes.title = false;
						changes.description = false;
					}}>Cancel</Button
				>
				<Form.Button disabled={!isChanged}>Save Changes</Form.Button>
			</Card.Footer>
		</form>
	</Card.Root>

	<AlertDialog.Root>
		<AlertDialog.Trigger class={buttonVariants({ variant: "destructive" })}>
			Delete
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<form class="contents" action="?/delete" method="POST" use:svelteEnhance>
				<AlertDialog.Header>
					<AlertDialog.Title>Do you want to delete subject {forumDetail.title}?</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={forumDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{forumDetail.title}</b>?
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
