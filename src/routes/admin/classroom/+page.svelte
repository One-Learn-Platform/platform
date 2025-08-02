<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";
	import { invalidateAll } from "$app/navigation";

	import Plus from "@lucide/svelte/icons/plus";
	import Lightbulb from "@lucide/svelte/icons/lightbulb";
	import Ellipsis from "@lucide/svelte/icons/ellipsis";

	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { formSchema } from "$lib/schema/classroom/schema";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { toast } from "svelte-sonner";
	import * as Select from "$lib/components/ui/select/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import DataTable from "$lib/components/table/data-table.svelte";
	import { columns } from "./columns";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const superform = superForm(data.form, {
		validators: zod4Client(formSchema),
	});

	const { form: formData, enhance, errors: formErrors } = superform;
	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
				toast.success(`Class ${form.delete.data?.name} successfully deleted`);
			} else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success) {
					invalidateAll();
					toast.success(`Class ${form.create.data?.name} successfully created`);
				} else {
					toast.error(form.create.message ?? "Unknown error");
				}
			}
		}
	});

	let classroom_data = $derived(data.classroomList);
</script>

<div class="flex flex-col gap-2">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<Dialog.Header>
				<Dialog.Title>Create Class</Dialog.Title>
				<Dialog.Description>Create a new class by filling out the form below.</Dialog.Description>
			</Dialog.Header>
			<form method="POST" action="?/create" use:enhance class="space-y-2">
				<Form.Field form={superform} name="gradesId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Grade</Form.Label>
							<Select.Root
								type="single"
								name={props.name}
								onValueChange={(value) => {
									$formData.gradesId = Number(value);
								}}
							>
								<Select.Trigger {...props}>
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

				<Dialog.Footer class="items-center">
					{#if $formErrors._errors}
						<FormErrors message={Object.values($formErrors._errors).join(", ")} />
					{/if}
					<Form.Button>Submit</Form.Button></Dialog.Footer
				>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={classroom_data} {columns} />
	<p class="inline-flex items-center pt-1 text-base text-muted-foreground">
		<Lightbulb class="mr-1 size-4" />Click <Ellipsis class="mx-2 size-4" /> to add student to class (enroll)
		or add subject to class (arrange schedule).
	</p>
</div>
