<script lang="ts">
	import type { PageProps } from "./$types";
	import { page } from "$app/state";
	import { invalidateAll } from "$app/navigation";

	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate,
		today,
	} from "@internationalized/date";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { formSchemaEdit, Role, type RoleEnum } from "$lib/schema/user/schema";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { cn } from "$lib/utils.js";
	import { toast } from "svelte-sonner";
	import { clsx } from "clsx";

	import { buttonVariants, Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";

	import { acronym } from "$lib/utils";

	import Calendar from "$lib/components/ui/calendar/calendar.svelte";

	let { data, form }: PageProps = $props();

	const userDetail = $derived(data.userData);
	const currentRole = $derived.by(() => {
		switch (userDetail.roleId) {
			case 1:
				return Role.Enum["super admin"];
			case 2:
				return Role.Enum["admin"];
			case 3:
				return Role.Enum["teacher"];
			case 4:
				return Role.Enum["student"];
			default:
				return Role.Enum["student"];
		}
	});
	const currentSchool = $derived(userDetail.schoolId?.toString() ?? "");

	const changes = $state({
		name: false,
		username: false,
		dob: false,
		role: false,
		school: false,
	});
	const isChanged = $derived(Object.values(changes).some((value) => value === true));
	const changesClass = clsx("border-blue-500 bg-blue-50");
	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zodClient(formSchemaEdit),
		id: "edit",

		onChange(event) {
			if (event) {
				if (event.paths.includes("name")) {
					if ($formData.name !== userDetail.fullname) {
						changes.name = true;
					} else {
						changes.name = false;
					}
				} else if (event.paths.includes("username")) {
					if ($formData.username !== userDetail.username) {
						changes.username = true;
					} else {
						changes.username = false;
					}
				} else if (event.paths.includes("dob")) {
					if ($formData.dob !== userDetail.dob) {
						changes.dob = true;
					} else {
						changes.dob = false;
					}
				} else if (event.paths.includes("role")) {
					if ($formData.role !== currentRole) {
						changes.role = true;
					} else {
						changes.role = false;
					}
				} else if (event.paths.includes("school")) {
					if ($formData.school !== currentSchool) {
						changes.school = true;
					} else {
						changes.school = false;
					}
				} else {
					changes.dob = false;
					changes.name = false;
					changes.username = false;
					changes.role = false;
					changes.school = false;
				}
			}
		},
	});
	const { form: formData, enhance, errors, reset } = superform;

	let value = $state<DateValue | undefined>();
	// @ts-expect-error - Let the value be undefined so the user locale will be used
	const df = new DateFormatter(undefined, {
		dateStyle: "long",
	});
	$effect(() => {
		value = $formData.dob ? parseDate($formData.dob) : undefined;
	});

	$effect(() => {
		$formData.name = userDetail.fullname ?? "";
		$formData.dob = userDetail.dob ?? "";
		$formData.username = userDetail?.username ?? "";
		$formData.role = currentRole;
		$formData.school = currentSchool;
	});
	const initial = $derived(acronym(userDetail.fullname));

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				toast.success(`User ${form.delete.data?.name} deleted`);
				invalidateAll();
			} else if (form.delete.message === "User not found") toast.error("User not found");
			else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.edit) {
				if (form.edit.success) {
					toast.success(`User ${form.edit.data?.name} edited`);
					invalidateAll();
					changes.name = false;
					changes.username = false;
					changes.dob = false;
					changes.role = false;
					changes.school = false;
				} else toast.error(form.edit.message ?? "Unknown error");
			}
		}
	});
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">User Detail</h1>

	<Card.Root>
		<Card.Content class="flex items-center justify-between px-6 py-4">
			<Avatar.Root class="size-16">
				<Avatar.Image src={userDetail.avatar} alt={`Avatar of ${userDetail.fullname}`} />
				<Avatar.Fallback>{initial}</Avatar.Fallback>
			</Avatar.Root>
			<div>
				<Button variant="outline">Upload</Button>
				<Button variant="destructive" outline>Remove</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display">Edit Profile</Card.Title>
		</Card.Header>
		<form
			method="POST"
			action="?/edit{page.url.searchParams.get('ref')
				? '&ref=' + page.url.searchParams.get('ref')
				: null}"
			class="space-y-2"
			use:enhance
		>
			<Card.Content>
				<Form.Field form={superform} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input
								{...props}
								bind:value={$formData.name}
								placeholder="John Doe"
								class={changes.name ? changesClass : ""}
							/>
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
							<Input
								{...props}
								bind:value={$formData.username}
								placeholder="Enter your username"
								class={changes.username ? changesClass : ""}
							/>
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
										changes.dob ? "border-blue-500 bg-blue-50" : "",
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
						<Form.Description>The date of birth of the user.</Form.Description>
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
									$formData.role = roleValue;
									// set timeout to allow the role value to be registered before changing the school value
									setTimeout(() => {
										if (value === Role.enum["super admin"]) {
											$formData.school = "";
										}
									}, 10);
								}}
								name={props.name}
							>
								<Select.Trigger {...props} class={changes.role ? changesClass : ""}>
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
								<Select.Trigger {...props} class={changes.school ? changesClass : ""}>
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
			</Card.Content>
			<Card.Footer class="justify-end gap-4">
				{#if $errors._errors}
					<p class="text-sm text-destructive">{Object.values($errors._errors).join(", ")}</p>
				{/if}
				<Button
					variant="outline"
					type="button"
					disabled={!isChanged}
					onclick={() => {
						reset({
							data: {
								name: userDetail.fullname,
								dob: userDetail.dob,
								username: userDetail.username,
								role: currentRole,
								school: currentSchool,
							},
						});
						changes.name = false;
						changes.username = false;
						changes.dob = false;
						changes.role = false;
						changes.school = false;
					}}>Cancel</Button
				>
				<Form.Button class="self-end" disabled={!isChanged}>Save Changes</Form.Button>
			</Card.Footer>
		</form>
	</Card.Root>

	<form action="?/delete" method="POST" class="contents">
		<input type="hidden" name="id" value={userDetail.id} />
		<Button variant="destructive" type="submit" class="w-full">Delete User</Button>
	</form>
</div>
