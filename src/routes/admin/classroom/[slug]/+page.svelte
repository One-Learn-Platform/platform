<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import type { PageProps } from "./$types";

	import { clsx } from "clsx";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { formSchemaEdit, type FormSchemaEdit } from "$lib/schema/classroom/schema";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";

	let { data, form }: PageProps = $props();

	const classroomDetail = $derived(data.classroom);

	const changes = $state(
		(Object.keys(formSchemaEdit.shape) as Array<keyof FormSchemaEdit>).reduce(
			(acc, field) => {
				acc[field] = false;
				return acc;
			},
			{} as Record<keyof FormSchemaEdit, boolean>,
		),
	);

	const isChanged = $derived(Object.values(changes).some((value) => value === true));
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaEdit),
		id: "edit",

		onChange(event) {
			if (event) {
				if (event.paths.includes("name")) {
					if ($formData.name !== classroomDetail.name) {
						changes.name = true;
					} else {
						changes.name = false;
					}
				} else if (event.paths.includes("gradesId")) {
					if ($formData.gradesId !== classroomDetail.gradesId) {
						changes.gradesId = true;
					} else {
						changes.gradesId = false;
					}
				}
			}
		},
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;

	$effect(() => {
		$formData.name = classroomDetail.name;
		$formData.gradesId = classroomDetail.gradesId;
	});

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else {
				toast.error(form.delete.message ?? "Unknown error");
			}
		} else if (form?.edit) {
			if (form.edit.success) {
				toast.success(`Role ${form.edit.data?.name} edited successfully`);
				invalidateAll();
			} else toast.error(form.edit.message ?? "Unknown error");
		}
	});
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">Class Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit Class</Card.Title>
			<Card.Description>
				Class name: <span class="font-mono font-semibold">
					{classroomDetail.gradesLevel}-{classroomDetail.name}
				</span>
			</Card.Description>
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
				<Form.Field form={superform} name="gradesId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Grade</Form.Label>
							<Select.Root
								type="single"
								name={props.name}
								value={$formData.gradesId?.toString() ?? ""}
								onValueChange={(value) => {
									$formData.gradesId = Number(value);
								}}
							>
								<Select.Trigger {...props} class={isChanged ? changesClass : ""}>
									{$formData.gradesId
										? data.gradesList.find((g) => g.id === $formData.gradesId)?.level
										: "Select a grade"}
								</Select.Trigger>
								<Select.Content>
									{#each data.gradesList as grade (grade.id)}
										<Select.Item value={grade.id.toString()} label={grade.level.toString()} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					{#if $formErrors.name}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Select the grade for this class.</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Class Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					{#if $formErrors.name}
						<Form.FieldErrors />
					{:else}
						<Form.Description>
							The name will be added after the grade, e.g., "11-A".
						</Form.Description>
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
					href="/admin/role"
					onclick={() => {
						reset({
							data: {
								name: classroomDetail.name,
							},
						});
						for (const key in changes) {
							changes[key as keyof typeof changes] = false;
						}
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
					<AlertDialog.Title>Do you want to delete role {classroomDetail.name}?</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={classroomDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{classroomDetail.name}</b>?
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
