<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";
	import { invalidateAll } from "$app/navigation";

	import Plus from "@lucide/svelte/icons/plus";
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import Lightbulb from "@lucide/svelte/icons/lightbulb";

	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { toast } from "svelte-sonner";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import DataTable from "$lib/components/table/data-table.svelte";
	import { formSchemaCreate } from "$lib/schema/subject/schema";
	import { columns } from "./columns";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const subjectList = $derived(data.subjectList);
	const superform = superForm(data.form, {
		validators: zod4Client(formSchemaCreate),
	});

	const { form: formData, enhance, errors: formErrors } = superform;

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
				toast.success(`Subject ${form.delete.data?.name} successfully deleted`);
			} else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success) {
					invalidateAll();
					toast.success(`Subject ${form.create.data?.name} successfully created`);
				} else toast.error(form.create.message ?? "Unknown error");
			}
		}
	});
</script>

<div class="flex flex-col gap-2 bg-background">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<Dialog.Header>
				<Dialog.Title>Add Subject</Dialog.Title>
				<Dialog.Description>Create a new subject by filling out the form below.</Dialog.Description>
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
							<Form.Label>Subject Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					{#if $formErrors.name}
						<Form.FieldErrors />
					{:else}
						<Form.Description>This is the Subject Name that will be displayed.</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="code">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Subject Code</Form.Label>
							<Input {...props} bind:value={$formData.code} class="font-mono" />
						{/snippet}
					</Form.Control>
					{#if $formErrors.code}
						<Form.FieldErrors />
					{:else}
						<Form.Description>This is the Subject Code that will be displayed.</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="chapterCount">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Chapter Count</Form.Label>
							<Input
								{...props}
								type="number"
								min="1"
								max="100"
								bind:value={$formData.chapterCount}
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrors.chapterCount}
						<Form.FieldErrors />
					{:else}
						<Form.Description>This is the Chapter Count that will be displayed.</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="subjectType">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Subject Type</Form.Label>
							<Select.Root
								type="single"
								value={$formData.subjectType}
								name={props.name}
								allowDeselect
								onValueChange={(value) => ($formData.subjectType = value)}
							>
								<Select.Trigger {...props}>
									{$formData.subjectType
										? data.subjectTypeList.find((t) => t.id.toString() === $formData.subjectType)
												?.name
										: "Select a subject type"}
								</Select.Trigger>
								<Select.Content>
									{#each data.subjectTypeList as subjectType (subjectType.id)}
										<Select.Item value={subjectType.id.toString()} label={subjectType.name}>
											{subjectType.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					{#if $formErrors.subjectType}
						<Form.FieldErrors />
					{:else}
						<Form.Description>Type of subject, laboratory or lesson</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="teacher">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Teacher</Form.Label>
							<Select.Root
								type="single"
								value={$formData.teacher}
								name={props.name}
								allowDeselect
								onValueChange={(value) => ($formData.teacher = value)}
							>
								<Select.Trigger {...props}>
									{$formData.teacher
										? data.teacherList.find((t) => t.id.toString() === $formData.teacher)?.fullname
										: "Select a teacher"}
								</Select.Trigger>
								<Select.Content>
									{#each data.teacherList as teacher (teacher.id)}
										<Select.Item value={teacher.id.toString()} label={teacher.fullname}>
											{teacher.fullname}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					{#if $formErrors.teacher}
						<Form.FieldErrors />
					{:else}
						<Form.Description>
							This will determine the teacher assigned to the subject.
						</Form.Description>
					{/if}
				</Form.Field>

				<Dialog.Footer class="items-center">
					{#if $formErrors._errors}
						<FormErrors message={Object.values($formErrors._errors).join(", ")} />
					{/if}
					<Form.Button>Submit</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={subjectList} {columns} />
	<p class="inline-flex items-center pt-1 text-base text-muted-foreground">
		<Lightbulb class="mr-1 size-4" />Click <Ellipsis class="mx-2 size-4" /> to add student to subject
		(enroll)
	</p>
</div>
