<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { onMount } from "svelte";
	import type { ActionData, PageServerData } from "./$types.js";

	import { formSchemaEdit } from "$lib/schema/material/schema";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { toast } from "svelte-sonner";

	import X from "@lucide/svelte/icons/x";

	import type { default as Quill } from "quill";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";

	const { data, form }: { data: PageServerData; form: ActionData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaEdit),
	});
	const { form: formData, enhance, errors } = superform;
	const attachmentProxies = fileProxy(formData, "attachment");
	let filesName = $state();

	let dialogOpen = $state(false);
	let toDeleteAttachment = $state("");

	$effect(() => {
		$formData.content = data.material?.content;
		$formData.title = data.material?.title;
		$formData.description = data.material?.description;
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

				quillInstance.setContents(
					quillInstance.clipboard.convert({ html: data.material?.content || "" }),
				);

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
		if (form?.create) {
			if (form.create?.success) {
				toast.success(form.create.message || "Material created successfully!");
				invalidateAll().then(() => {
					if (quillInstance) {
						quillInstance.clipboard.convert({ html: data.material?.content || "" });
					}
					$formData.content = data.material?.content;
					$formData.title = data.material?.title;
					$formData.description = data.material?.description;
				});
			} else {
				toast.error(form.create.message || "Failed to create material.");
			}
		} else if (form?.delete) {
			if (form.delete?.success) {
				invalidateAll();
				toast.success(form.delete.message || "Material deleted successfully!");
			} else {
				toast.error(form.delete.message || "Failed to delete material.");
			}
		}
	});
</script>

<div class="flex flex-row items-center justify-between gap-2">
	<h1 class="text-2xl font-semibold tracking-tight">Edit Material</h1>
	<AlertDialog.Root>
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="destructive" type="button">Delete Material</Button>
			{/snippet}
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<form action="?/delete" method="POST" class="contents" use:svelteEnhance>
				<input type="hidden" name="material_id" value={data.material?.id} />
				<AlertDialog.Header>
					<AlertDialog.Title
						>Are you sure you want to delete {data.material?.title}?</AlertDialog.Title
					>
					<AlertDialog.Description>
						This action cannot be undone. <b>{data.material?.title}</b> will be permanently deleted.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
				</AlertDialog.Footer>
			</form>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
<form
	action="?/edit"
	method="POST"
	class="flex w-full flex-col gap-2"
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
				<Textarea
					{...props}
					bind:value={$formData.description}
					class="resize-y"
					placeholder="Short description of the material"
				/>
			{/snippet}
		</Form.Control>
		{#if $errors.description}
			<Form.FieldErrors />
		{:else}
			<Form.Description>Short description about the material</Form.Description>
		{/if}
	</Form.Field>

	<Form.Field form={superform} name="content" class="flex h-fit flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Content</Form.Label>
				<div bind:this={editorElement}></div>
				<input
					{...props}
					type="hidden"
					bind:value={$formData.content}
					placeholder="Content of the forum"
				/>
			{/snippet}
		</Form.Control>
		{#if $errors.content}
			<Form.FieldErrors />
		{:else}
			<Form.Description>Content of the forum</Form.Description>
		{/if}
	</Form.Field>

	<Form.Field form={superform} name="attachment" class="">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Attachment</Form.Label>
				<Input
					{...props}
					type="file"
					multiple
					bind:files={$attachmentProxies}
					bind:value={filesName}
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
	{#if data.material?.attachment}
		{@const fileCategory = getFileCategory(data.material.attachment)}
		{@const fileName = data.material.attachment.split("/").pop() || data.material.attachment}
		{#if fileCategory === "image"}
			<img
				src="{PUBLIC_R2_URL}/{data.material.attachment}"
				alt=""
				class="h-auto w-1/5 max-w-full min-w-xs"
			/>
		{:else}
			{@const FileIcon = getFileIcon(fileCategory)}
			<a
				href="{PUBLIC_R2_URL}/{data.material.attachment}"
				target="_blank"
				class="group flex h-fit max-w-28 flex-col items-center gap-1 rounded-xs border p-2"
			>
				<FileIcon class="" />
				<span class="leading-tight break-all text-informative group-hover:underline">
					{fileName}
				</span>
			</a>
		{/if}
	{/if}
	<Form.Button class="self-end">Save Edit</Form.Button>
</form>

<AlertDialog.Root open={dialogOpen} onOpenChange={(open) => (dialogOpen = open)}>
	<AlertDialog.Content>
		<form action="?/deleteAttachment" method="POST" class="contents" use:svelteEnhance>
			<input type="hidden" name="attachment_name" value={toDeleteAttachment} />
			<AlertDialog.Header>
				<AlertDialog.Title>Are you sure you want to delete {toDeleteAttachment}?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. <b>{toDeleteAttachment}</b> will be permanently deleted.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
