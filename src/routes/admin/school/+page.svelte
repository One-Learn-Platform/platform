<script lang="ts">
	import type { PageServerData, ActionData } from "./$types";

	import Plus from "@lucide/svelte/icons/plus";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
	import { superForm, fileProxy } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	import { toast } from "svelte-sonner";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Form from "$lib/components/ui/form/index.js";

	import DataTable from "$lib/components/table/data-table.svelte";
	import { columns } from "./columns";
	import { formSchemaCreate } from "$lib/schema/school/schema";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const schoolList = $derived(data.schoolList);
	const superform = superForm(data.form, {
		validators: zodClient(formSchemaCreate),
	});

	const { form: formData, enhance, errors: formErrors } = superform;
	const proxy = fileProxy(formData, "logo");
	let fileValue = $state();

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success)
				toast.success(`School ${form.delete.data?.name} successfully deleted`);
			else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success)
					toast.success(`School ${form.create.data?.name} successfully created`);
				else toast.error(form.create.message ?? "Unknown error");
			}
		}
	});
</script>

<div class="flex flex-col gap-2 bg-background">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<Dialog.Header>
				<Dialog.Title>Add School</Dialog.Title>
				<Dialog.Description>Create a new school by filling out the form below.</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/create"
				class="space-y-2"
				enctype="multipart/form-data"
				use:enhance
			>
				<Form.Field form={superform} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					{#if !$formErrors.name}
						<Form.Description
							>This is the School Name that will be available to choose.
						</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="logo">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School Logo</Form.Label>
							<Input
								{...props}
								type="file"
								accept="image/*"
								bind:files={$proxy}
								bind:value={fileValue}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					{#if !$formErrors.logo}
						<Form.Description>This is the Logo that will be displayed..</Form.Description>
					{/if}
				</Form.Field>

				<Dialog.Footer class="items-center">
					{#if $formErrors._errors}
						<div
							class="flex max-w-md items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive"
						>
							<TriangleAlert strokeWidth={1.5} class="min-w-fit" />
							<p>{Object.values($formErrors._errors).join(", ")}</p>
						</div>
					{/if}
					<Form.Button>Submit</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={schoolList} {columns} />
</div>
