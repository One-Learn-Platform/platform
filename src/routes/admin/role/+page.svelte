<script lang="ts">
	import type { PageServerData } from "./$types";

	import Plus from "@lucide/svelte/icons/plus";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { formSchema, type FormSchema } from "./schema";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	import DataTable from "$lib/components/table/data-table.svelte";
	import { columns } from "./columns";

	let { data }: { data: PageServerData } = $props();
	const form = superForm(data.form, {
		validators: zodClient(formSchema),
	});

	const { form: formData, enhance, errors } = form;
	$effect(() => {
		$inspect(data.roleList);
	});

	let role_data = data.roleList;
</script>

<div class="flex flex-col gap-2">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<Dialog.Header>
				<Dialog.Title>Add Role</Dialog.Title>
				<Dialog.Description>Create a new role by filling out the form below.</Dialog.Description>
			</Dialog.Header>
			<form method="POST" use:enhance>
				<Form.Field {form} name="roleName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Role Name</Form.Label>
							<Input {...props} bind:value={$formData.roleName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					{#if !$errors.roleName}
						<Form.Description>
							This is the Role Name that you want to assign to the user.
						</Form.Description>
					{/if}
				</Form.Field>

				<Dialog.Footer class="items-center">
					{#if $errors._errors}
						<p class="text-sm text-destructive">{Object.values($errors._errors).join(", ")}</p>
					{/if}
					<Form.Button>Submit</Form.Button></Dialog.Footer
				>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={role_data} {columns} />
</div>
