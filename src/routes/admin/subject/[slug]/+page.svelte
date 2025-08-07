<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import type { PageProps } from "./$types";

	import { formSchemaEdit } from "$lib/schema/subject/schema";
	import { clsx } from "clsx";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

	let { data, form }: PageProps = $props();

	const subjectDetail = $derived(data.subjectData);

	let changes = $state({
		name: false,
		code: false,
		teacher: false,
		chapterCount: false,
		subjectType: false,
		grades: false,
	});
	const isChanged = $derived(changes);
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaEdit),
		id: "edit",
		onChange(event) {
			if (event) {
				if (event.paths.includes("name")) {
					if ($formData.name !== subjectDetail.name) {
						changes.name = true;
					} else {
						changes.name = false;
					}
				}
				if (event.paths.includes("teacher")) {
					if (Number($formData.teacher) !== subjectDetail.teacher) {
						changes.teacher = true;
					} else {
						changes.teacher = false;
					}
				}
			}
		},
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;

	$effect(() => {
		$formData.name = subjectDetail.name;
		$formData.code = subjectDetail.code;
		$formData.teacher = subjectDetail.teacher?.toString();
		$formData.subjectType = subjectDetail.subjectType?.toString();
		$formData.chapterCount = subjectDetail.chapterCount;
		$formData.gradesId = subjectDetail.gradesId;
	});

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		} else if (form?.edit) {
			if (form.edit.success) {
				invalidateAll();
				toast.success(`Subject ${form.edit.data?.name} edited successfully`);
			} else toast.error(form.edit.message ?? "Unknown error");
		}
	});
</script>

<svelte:head>
	<title>Edit Subject | One Learn</title>
</svelte:head>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">Subject Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit Subject</Card.Title>
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
							<Form.Label>Subject Name</Form.Label>
							<Input
								{...props}
								bind:value={$formData.name}
								class={changes.name ? changesClass : ""}
							/>
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
							<Input
								{...props}
								bind:value={$formData.code}
								class={[changes.code ? changesClass : "", "font-mono"]}
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrors.code}
						<Form.FieldErrors />
					{:else}
						<Form.Description>
							This is the Subject code used to differentiate subject.
						</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="gradesId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Grades</Form.Label>
							<Select.Root
								type="single"
								name={props.name}
								onValueChange={(value) => {
									$formData.gradesId = Number(value);
								}}
							>
								<Select.Trigger {...props} class={changes.grades ? changesClass : ""}>
									{$formData.gradesId
										? data.gradesList.find((g) => g.id === $formData.gradesId)?.level
										: "Select a grades ID"}
								</Select.Trigger>
								<Select.Content>
									{#each data.gradesList as grade (grade.id)}
										<Select.Item value={grade.id.toString()} label={grade.level.toString()}>
											{grade.level}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					{#if $formErrors.gradesId}
						<Form.FieldErrors />
					{:else}
						<Form.Description>This is the Grades ID that will be displayed.</Form.Description>
					{/if}
				</Form.Field>

				<Form.Field form={superform} name="chapterCount">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Chapter Count</Form.Label>
							<Input
								{...props}
								type="number"
								min="0"
								max="100"
								placeholder="12"
								bind:value={$formData.chapterCount}
								class={changes.chapterCount ? changesClass : ""}
							/>
						{/snippet}
					</Form.Control>
					{#if $formErrors.chapterCount}
						<Form.FieldErrors />
					{:else}
						<Form.Description>The amount of chapter.</Form.Description>
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
						<Form.Description>This is the Teacher that will be displayed.</Form.Description>
					{/if}
				</Form.Field>
			</Card.Content>

			<Card.Footer class="justify-end gap-4">
				{#if $formErrors._errors}
					<div
						class="flex max-w-md items-center gap-2 rounded-md bg-destructive/5 p-2 text-sm text-destructive"
					>
						<TriangleAlert strokeWidth={1.5} class="min-w-fit" />
						<p>{Object.values($formErrors._errors).join(", ")}</p>
					</div>
				{/if}
				<Button
					variant="outline"
					type="button"
					href="/admin/subject"
					onclick={() => {
						reset({
							data: {
								name: subjectDetail.name ?? "",
								teacher: undefined,
							},
						});
						changes.name = false;
						changes.teacher = false;
						changes.chapterCount = false;
						changes.subjectType = false;
						changes.grades = false;
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
					<AlertDialog.Title>Do you want to delete subject {subjectDetail.name}?</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={subjectDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{subjectDetail.name}</b>?
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
