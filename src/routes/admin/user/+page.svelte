<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";

	import { formSchemaWithPass, Role, type RoleEnum } from "$lib/schema/user/schema";
	import { cn } from "$lib/utils.js";
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today,
	} from "@internationalized/date";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import Plus from "@lucide/svelte/icons/plus";
	import { toast } from "svelte-sonner";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import DataTable from "$lib/components/table/data-table.svelte";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import { columns } from "./columns.js";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaWithPass),
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;
	const proxy = fileProxy(formData, "avatar");
	let fileValue = $state();

	let value = $state<DateValue | undefined>();
	// @ts-expect-error - value is undefined so the browser default will be used
	const df = new DateFormatter(undefined, {
		dateStyle: "long",
	});
	$effect(() => {
		value = $formData.dob ? parseDate($formData.dob) : undefined;
	});
	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) toast.success(`User ${form.delete.data?.fullname} deleted`);
			else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success) toast.success(`User ${form.create.data?.fullname} created`);
				else toast.error(form.create.message ?? "Unknown error");
			}
		}
	});
</script>

<div class="flex flex-col gap-2">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<form
				method="POST"
				action="?/create"
				class="space-y-2"
				enctype="multipart/form-data"
				use:enhance
			>
				<Dialog.Header>
					<Dialog.Title>Add User</Dialog.Title>
					<Dialog.Description>
						Create a new user by filling out the form below. Make sure to tell the user to change
						their password immediately.
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid grid-cols-2 gap-2 space-y-1">
					<Form.Field form={superform} name="avatar" class="col-span-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Avatar</Form.Label>
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
						{#if !$formErrors.avatar}
							<Form.Description>This is the Avatar of the User</Form.Description>
						{/if}
					</Form.Field>

					<Form.Field form={superform} name="fullname">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.fullname} placeholder="John Doe" />
							{/snippet}
						</Form.Control>
						{#if !$formErrors.fullname}
							<Form.Description>The fullname of the user.</Form.Description>
						{/if}
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superform} name="username">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Username</Form.Label>
								<Input
									{...props}
									bind:value={$formData.username}
									placeholder="Enter your username"
								/>
							{/snippet}
						</Form.Control>
						{#if !$formErrors.username}
							<Form.Description>Username will be used for login</Form.Description>
						{/if}
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superform} name="dob" class="col-span-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Date of birth</Form.Label>
								<Popover.Root>
									<Popover.Trigger
										{...props}
										class={cn(
											buttonVariants({ variant: "outline" }),
											"w-full text-left font-normal",
											!value && "text-muted-foreground",
										)}
									>
										{value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
										<CalendarIcon class="ml-auto size-4 opacity-50" />
									</Popover.Trigger>
									<Popover.Content class="w-auto p-0" side="top">
										<Calendar
											yearSelect={true}
											type="single"
											value={value as DateValue}
											minValue={new CalendarDate(2000, 1, 1)}
											maxValue={today(getLocalTimeZone())}
											calendarLabel="Date of birth"
											onValueChange={(v) => {
												if (v) {
													$formData.dob = v.toString();
												} else {
													$formData.dob = "";
												}
											}}
										/>
									</Popover.Content>
								</Popover.Root>
								<input type="hidden" hidden value={$formData.dob} name={props.name} />
							{/snippet}
						</Form.Control>
						{#if !$formErrors.dob}
							<Form.Description>date of birth of the user.</Form.Description>
						{/if}
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superform} name="password" class="col-span-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Input
									{...props}
									bind:value={$formData.password}
									placeholder="Enter your password"
								/>
							{/snippet}
						</Form.Control>
						{#if !$formErrors.password}
							<Form.Description>
								This a just a temporary password. Choose an easy one
							</Form.Description>
						{/if}
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superform} name="roleId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Role</Form.Label>
								<Select.Root
									type="single"
									value={$formData.roleId}
									onValueChange={(value) => {
										const roleValue = value as RoleEnum;
										if (value === Role.enum["super admin"]) {
											$formData.schoolId = undefined;
										} else {
											$formData.schoolId = $formData.schoolId;
										}
										$formData.roleId = roleValue;
									}}
									name={props.name}
								>
									<Select.Trigger {...props}>
										{$formData.roleId
											? $formData.roleId.replace(
													/\w\S*/g,
													(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
												)
											: "Select a role"}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Role</Select.Label>
											{#each Object.values(Role.options) as role (role)}
												{@const roleTitleCase = role.replace(
													/\w\S*/g,
													(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
												)}
												<Select.Item value={role} label={roleTitleCase}>{roleTitleCase}</Select.Item
												>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						{#if !$formErrors.roleId}
							<Form.Description>
								Select a role for the user. This will determine their access level.
							</Form.Description>
						{/if}
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superform} name="schoolId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>School</Form.Label>
								<Select.Root
									type="single"
									value={$formData.schoolId}
									name={props.name}
									allowDeselect
									disabled={$formData.roleId === Role.enum["super admin"]}
									onValueChange={(value) => ($formData.schoolId = value)}
								>
									<Select.Trigger {...props}>
										{$formData.schoolId
											? data.schoolList.find(
													(school) => school.id.toString() === $formData.schoolId,
												)?.name
											: "Select a school"}
									</Select.Trigger>
									<Select.Content>
										{#each data.schoolList as school (school)}
											<Select.Item value={school.id.toString()} label={school.name}>
												{school.name}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						{#if !$formErrors.schoolId}
							<Form.Description>
								This will determine the school affiliation of the user.
							</Form.Description>
						{/if}
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Dialog.Footer class="items-center">
					{#if $formErrors._errors}
						<FormErrors message={Object.values($formErrors._errors).join(", ")} />
					{/if}
					<Dialog.Close
						class={buttonVariants({ variant: "outline" })}
						type="reset"
						onclick={() => reset()}
					>
						Cancel
					</Dialog.Close>
					<Form.Button>Submit</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<DataTable data={data.userList} {columns} />
</div>
