<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import type { PageProps } from "./$types";

	import { formSchemaEdit } from "$lib/schema/school/schema";
	import { clsx } from "clsx";
	import { toast } from "svelte-sonner";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";

	let { data, form }: PageProps = $props();

	const schoolDetail = $derived(data.schoolData);

	let changes = $state({
		name: false,
		logo: false,
	});
	const isChanged = $derived(changes);
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zodClient(formSchemaEdit),
		id: "edit",
		onChange(event) {
			if (event) {
				if (event.paths.includes("name")) {
					if ($formData.name !== schoolDetail.name) {
						changes.name = true;
					} else {
						changes.name = false;
					}
				}
				if (event.paths.includes("logo")) {
					changes.logo = true;
				}
			}
		},
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;
	const proxy = fileProxy(formData, "logo");
	let fileValue = $state();

	$effect(() => {
		$formData.name = schoolDetail.name;
	});

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		} else if (form?.edit) {
			if (form.edit.success) {
				invalidateAll();
				toast.success(`School ${form.edit.data?.name} edited successfully`);
			} else toast.error(form.edit.message ?? "Unknown error");
		}
	});
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">School Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit School</Card.Title>
		</Card.Header>
		<form
			method="POST"
			action="?/edit{page.url.searchParams.get('ref')
				? '&ref=' + page.url.searchParams.get('ref')
				: ''}"
			class="space-y-2"
			enctype="multipart/form-data"
			use:enhance
		>
			<Card.Content class="space-y-2">
				<Form.Field form={superform} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School Name</Form.Label>
							<Input
								{...props}
								bind:value={$formData.name}
								class={changes.name ? changesClass : ""}
							/>
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
								class={changes.logo ? changesClass : ""}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					{#if !$formErrors.logo}
						<Form.Description>This is the Logo that will be displayed..</Form.Description>
					{/if}
				</Form.Field>
			</Card.Content>

			<Card.Footer class="justify-end gap-4">
				{#if $formErrors._errors}
					<FormErrors message={Object.values($formErrors._errors).join(", ")} />
				{/if}
				<Button
					variant="outline"
					type="button"
					disabled={!isChanged}
					onclick={() => {
						reset({
							data: {
								name: schoolDetail.name ?? "",
								logo: undefined,
							},
						});
						changes.name = false;
						changes.logo = false;
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
					<AlertDialog.Title>Do you want to delete school {schoolDetail.name}?</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={schoolDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{schoolDetail.name}</b>?
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
