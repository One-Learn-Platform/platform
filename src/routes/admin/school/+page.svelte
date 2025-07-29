<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";
	import { invalidateAll } from "$app/navigation";

	import { formSchemaCreate } from "$lib/schema/school/schema";
	import Plus from "@lucide/svelte/icons/plus";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { toast } from "svelte-sonner";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import DataTable from "$lib/components/table/data-table.svelte";
	import { columns } from "./columns";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const schoolList = $derived(data.schoolList);
	const superform = superForm(data.form, {
		validators: zod4Client(formSchemaCreate),
	});

	const { form: formData, enhance, errors: formErrors, reset } = superform;
	const proxy = fileProxy(formData, "logo");
	let fileValue = $state();

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
				toast.success(`School ${form.delete.data?.name} successfully deleted`);
			} else {
				toast.error(form.delete.message ?? "Unknown error");
			}
		} else {
			if (form?.create) {
				if (form.create.success) {
					invalidateAll();
					toast.success(`School ${form.create.data?.name} successfully created`);
				} else {
					toast.error(form.create.message ?? "Unknown error");
				}
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
							<Input {...props} bind:value={$formData.name} placeholder="School Name" />
						{/snippet}
					</Form.Control>
					{#if $formErrors.name}
						<Form.FieldErrors />
					{:else}
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
					{#if $formErrors.logo}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Square logo recommended (aspect ratio 1:1).</Form.Description>
					{/if}
					{#if $proxy.length > 0}
						{#each $proxy as file (file.name)}
							<figure class="p-1 text-sm text-muted-foreground">
								<img src={URL.createObjectURL(file)} class="max-w-1/2" alt="New Logo" />
								<figcaption>Preview</figcaption>
							</figure>
						{/each}
					{/if}
				</Form.Field>

				<Dialog.Footer class="items-center">
					<Dialog.Close
						class={buttonVariants({ variant: "outline" })}
						type="reset"
						onclick={() => reset()}
					>
						Close
					</Dialog.Close>

					{#if $formErrors._errors}
						<FormErrors message={Object.values($formErrors._errors).join(", ")} />
					{/if}

					<Form.Button>Submit</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={schoolList} {columns} />
</div>
