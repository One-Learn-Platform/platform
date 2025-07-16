<script lang="ts">
	import { onMount } from "svelte";
	import type { PageServerData } from "./$types.js";

	import { formSchema } from "$lib/schema/material/schema";
	import { superForm, filesProxy, fileProxy } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import X from "@lucide/svelte/icons/x";

	import type { default as Quill } from "quill";

	import { getFileIcon } from "$lib/functions/material";

	const { data }: { data: PageServerData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors } = superform;
	const attachmentProxies = filesProxy(formData, "attachment");
	const thumbnailProxies = fileProxy(formData, "thumbnail");
	let attachmentNames = $state();
	let thumbnailNames = $state();

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
</script>

<h1 class="text-2xl font-semibold tracking-tight">Create New Material</h1>
<form
	action="?/create"
	method="POST"
	class="flex w-full grow flex-col gap-2"
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

	<Form.Field form={superform} name="thumbnail" class="">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Thumbnail</Form.Label>
				<Input
					{...props}
					type="file"
					accept="image/*,video/*"
					bind:files={$thumbnailProxies}
					bind:value={thumbnailNames}
				/>
			{/snippet}
		</Form.Control>
		{#if $errors.thumbnail}
			<Form.FieldErrors />
		{:else}
			<Form.Description>Attach any files up to 100MB</Form.Description>
		{/if}
	</Form.Field>

	<Form.Field form={superform} name="content" class="flex h-fit min-h-1/2 flex-col">
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
					bind:value={attachmentNames}
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

	<Form.Button class="self-end">Create</Form.Button>
</form>
