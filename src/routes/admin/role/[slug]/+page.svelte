<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import type { PageProps } from "./$types";

	import { clsx } from "clsx";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { formSchema } from "$lib/schema/role/schema";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";

	let { data, form }: PageProps = $props();

	const roleDetail = $derived(data.roleData);

	let changes = $state(false);
	const isChanged = $derived(changes);
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
		id: "edit",

		onChange(event) {
			if (event) {
				if (event.paths.includes("name")) {
					if ($formData.name !== roleDetail.name) {
						changes = true;
					} else {
						changes = false;
					}
				}
			}
		},
	});
	const { form: formData, enhance, errors, reset } = superform;

	$effect(() => {
		$formData.name = roleDetail.name;
	});

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		} else if (form?.edit) {
			if (form.edit.success) {
				toast.success(`User ${form.edit.data?.name} edited successfully`);
				invalidateAll();
			} else toast.error(form.edit.message ?? "Unknown error");
		}
	});
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">User Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit Role</Card.Title>
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
				<Form.Field form={superform} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input
								{...props}
								bind:value={$formData.name}
								placeholder="John Doe"
								class={changes ? changesClass : ""}
							/>
						{/snippet}
					</Form.Control>
					{#if $errors.name}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Name of the role to be displayed.</Form.Description>
					{/if}
				</Form.Field>
			</Card.Content>

			<Card.Footer class="justify-end gap-4">
				{#if $errors._errors}
					<FormErrors message={Object.values($errors._errors).join(", ")} />
				{/if}
				<Button
					variant="outline"
					type="button"
					disabled={!isChanged}
					onclick={() => {
						reset({
							data: {
								name: roleDetail.name,
							},
						});
						changes = false;
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
					<AlertDialog.Title>Do you want to delete role {roleDetail.name}?</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={roleDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{roleDetail.name}</b>?
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
