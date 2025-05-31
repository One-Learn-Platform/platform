<script lang="ts">
	import type { PageServerData, ActionData } from "./$types";

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
	import { formSchemaCreate, Role, type RoleEnum } from "../../../lib/schema/user/schema";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { cn } from "$lib/utils.js";
	import { toast } from "svelte-sonner";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";

	import DataTable from "$lib/components/table/data-table.svelte";
	import { columns } from "./columns.js";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zodClient(formSchemaCreate),
	});
	const { form: formData, enhance, errors, reset } = superform;

	let value = $state<DateValue | undefined>();
	const df = new DateFormatter(getLocalTimeZone(), {
		dateStyle: "long",
	});
	$effect(() => {
		value = $formData.dob ? parseDate($formData.dob) : undefined;
	});
	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) toast.success(`User ${form.delete.data?.name} deleted`);
			else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success) toast.success(`User ${form.create.data?.name} created`);
				else toast.error(form.create.message ?? "Unknown error");
			}
		}
	});
</script>

<div class="flex flex-col gap-2">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Plus />Add</Dialog.Trigger>
		<Dialog.Content class="">
			<form method="POST" action="?/create" class="space-y-2" use:enhance>
				<Dialog.Header>
					<Dialog.Title>Add User</Dialog.Title>
					<Dialog.Description
						>Create a new user by filling out the form below. Make sure to tell the user to change
						their password immediately.</Dialog.Description
					>
				</Dialog.Header>
				<Form.Field form={superform} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} placeholder="John Doe" />
						{/snippet}
					</Form.Control>
					{#if !$errors.name}
						<Form.Description>The fullname of the user.</Form.Description>
					{/if}
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superform} name="username">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Username</Form.Label>
							<Input {...props} bind:value={$formData.username} placeholder="Enter your username" />
						{/snippet}
					</Form.Control>
					{#if !$errors.username}
						<Form.Description>Username will be used for login</Form.Description>
					{/if}
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superform} name="dob">
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
					{#if !$errors.dob}
						<Form.Description>date of birth of the user.</Form.Description>
					{/if}
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superform} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Password</Form.Label>
							<Input {...props} bind:value={$formData.password} placeholder="Enter your password" />
						{/snippet}
					</Form.Control>
					{#if !$errors.password}
						<Form.Description>
							This a just a temporary password. Choose an easy one
						</Form.Description>
					{/if}
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superform} name="role">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Role</Form.Label>
							<Select.Root
								type="single"
								value={$formData.role}
								onValueChange={(value) => {
									const roleValue = value as RoleEnum;
									if (value === Role.enum["super admin"]) {
										$formData.school = undefined;
									} else {
										$formData.school = $formData.school;
									}
									$formData.role = roleValue;
								}}
								name={props.name}
							>
								<Select.Trigger {...props}>
									{$formData.role
										? $formData.role.replace(
												/\w\S*/g,
												(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
											)
										: "Select a role"}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.GroupHeading>Role</Select.GroupHeading>
										{#each Object.values(Role.options) as role (role)}
											{@const roleTitleCase = role.replace(
												/\w\S*/g,
												(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
											)}
											<Select.Item value={role} label={roleTitleCase}>{roleTitleCase}</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					{#if !$errors.role}
						<Form.Description>
							Select a role for the user. This will determine their access level.
						</Form.Description>
					{/if}
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superform} name="school">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School</Form.Label>
							<Select.Root
								type="single"
								value={$formData.school}
								name={props.name}
								allowDeselect
								disabled={$formData.role === Role.enum["super admin"]}
								onValueChange={(value) => ($formData.school = value)}
							>
								<Select.Trigger {...props}>
									{$formData.school
										? $formData.school.replace(
												/\w\S*/g,
												(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
											)
										: "Select a school"}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="school a" label="School A">School A</Select.Item>
									<Select.Item value="school b" label="School B">School B</Select.Item>
									<Select.Item value="school c" label="School C">School C</Select.Item>
									<Select.Item value="school d" label="School D">School D</Select.Item>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					{#if !$errors.school}
						<Form.Description>
							This will determine the school affiliation of the user.
						</Form.Description>
					{/if}
					<Form.FieldErrors />
				</Form.Field>

				<Dialog.Footer class="items-center">
					{#if $errors._errors}
						<p class="text-sm text-destructive">{Object.values($errors._errors).join(", ")}</p>
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
