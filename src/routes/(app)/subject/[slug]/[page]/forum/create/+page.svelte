<script lang="ts">
	import { onMount } from "svelte";
	import type { PageServerData } from "./$types.js";

	import { formSchemaCreate } from "$lib/schema/forum/schema";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import type { default as Quill } from "quill";

	const { data }: { data: PageServerData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaCreate),
	});
	const { form: formData, enhance, errors } = superform;

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

<h1 class="text-2xl font-semibold tracking-tight">Create A Forum</h1>
<form action="?/create" method="POST" class="flex w-full grow flex-col gap-2" use:enhance>
	<Form.Field form={superform} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Title</Form.Label>
				<Input {...props} bind:value={$formData.title} placeholder="John Doe" />
			{/snippet}
		</Form.Control>
		{#if $errors.title}
			<Form.FieldErrors />
		{:else}
			<Form.Description>Title of the forum</Form.Description>
		{/if}
	</Form.Field>

	<Form.Field form={superform} name="description" class="flex h-fit min-h-1/2 flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Content</Form.Label>
				<div bind:this={editorElement}></div>
				<input
					{...props}
					type="hidden"
					bind:value={$formData.description}
					placeholder="Description of the forum"
				/>
			{/snippet}
		</Form.Control>
		{#if $errors.description}
			<Form.FieldErrors />
		{:else}
			<Form.Description>Content of the forum</Form.Description>
		{/if}
	</Form.Field>
	<Form.Button class="self-end">Create</Form.Button>
</form>
