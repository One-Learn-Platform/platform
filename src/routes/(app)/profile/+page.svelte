<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageProps } from "./$types";

	import {
		formSchemaPassOnly,
		formSchemaUploadImage,
		formSchemaWithoutPass,
		Role,
		type RoleEnum,
	} from "$lib/schema/user/schema";
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
	import { clsx } from "clsx";
	import { toast } from "svelte-sonner";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	import { acronym } from "$lib/utils";

	import FormErrors from "$lib/components/error/form-errors.svelte";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";

	let { data, form }: PageProps = $props();

	let dialogOpen = $state(false);
	let alertDialogOpen = $state(false);

	const userDetail = $derived(data.userData);
	const currentRole = $derived.by(() => {
		switch (userDetail.roleId) {
			case 1:
				return Role.enum["super admin"];
			case 2:
				return Role.enum["admin"];
			case 3:
				return Role.enum["teacher"];
			case 4:
				return Role.enum["student"];
			default:
				return Role.enum["student"];
		}
	});
	const currentSchool = $derived(
		data.schoolList.find((school) => school.id === userDetail.schoolId)?.id.toString() ?? "",
	);

	const changes = $state({
		fullname: false,
		username: false,
		dob: false,
		roleId: false,
		schoolId: false,
	});
	const isChanged = $derived(Object.values(changes).some((value) => value === true));
	const changesClass = clsx("border-blue-500 bg-blue-50");

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchemaWithoutPass),
		id: "edit",

		onChange(event) {
			if (event) {
				if (event.paths.includes("fullname")) {
					if ($formData.fullname !== userDetail.fullname) {
						changes.fullname = true;
					} else {
						changes.fullname = false;
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
				} else if (event.paths.includes("roleId")) {
					if ($formData.roleId !== currentRole) {
						changes.roleId = true;
					} else {
						changes.roleId = false;
					}
				} else if (event.paths.includes("schoolId")) {
					if ($formData.schoolId !== currentSchool) {
						changes.schoolId = true;
					} else {
						changes.schoolId = false;
					}
				} else {
					changes.dob = false;
					changes.fullname = false;
					changes.username = false;
					changes.roleId = false;
					changes.schoolId = false;
				}
			}
		},
	});
	const superformUpload = superForm(data.uploadForm, {
		taintedMessage: null,
		validators: zod4Client(formSchemaUploadImage),
	});
	const superFormPass = superForm(data.passForm, {
		taintedMessage: null,
		validators: zod4Client(formSchemaPassOnly),
	});
	const avatarProxy = fileProxy(superformUpload, "avatar");
	let avatarName = $state();
	const avatarUrl = $derived(URL.createObjectURL($avatarProxy?.[0] ?? new Blob()));

	const { form: formData, enhance, errors, reset } = superform;
	const { enhance: enhanceUpload, errors: errorsUpload } = superformUpload;
	const {
		form: formDataPass,
		enhance: enhancePass,
		errors: errorsPass,
		reset: resetPass,
	} = superFormPass;

	let value = $derived($formData.dob ? parseDate($formData.dob) : undefined);
	// @ts-expect-error - Let the value be undefined so the user locale will be used
	const df = new DateFormatter(undefined, {
		dateStyle: "long",
	});
	$effect(() => {
		$formData.fullname = userDetail.fullname ?? "";
		$formData.dob = userDetail.dob ?? "";
		$formData.username = userDetail?.username ?? "";
		$formData.roleId = currentRole;
		$formData.schoolId = currentSchool;
	});
	const initial = $derived(acronym(userDetail.fullname));

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				toast.success(`User ${form.delete.data?.fullname} deleted`);
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		} else if (form?.edit) {
			if (form.edit.success) {
				toast.success(`User ${form.edit.data?.fullname} edited successfully`);
				invalidateAll();
				changes.fullname = false;
				changes.username = false;
				changes.dob = false;
				changes.roleId = false;
				changes.schoolId = false;
			} else toast.error(form.edit.message ?? "Unknown error");
		} else if (form?.upload) {
			if (form.upload.success) {
				toast.success(`Avatar updated successfully`);
				invalidateAll();
			} else toast.error(form.upload.message ?? "Unknown error");
		} else if (form?.changePassword) {
			if (form.changePassword.success) {
				toast.success(`Password changed successfully`);
				invalidateAll();
			} else toast.error(form.changePassword.message ?? "Unknown error");
		}
	});
</script>

<svelte:head>
	<title>Profile | One Learn</title>
	<meta name="description" content="Edit your profile information." />
</svelte:head>

<h1 class="font-display text-3xl font-semibold tracking-tight">Profile</h1>

<Card.Root>
	<Card.Content class="flex items-center justify-between px-6 py-4">
		<Avatar.Root class="size-16">
			<Avatar.Image
				src="{PUBLIC_R2_URL}/{userDetail.avatar}"
				alt={`Avatar of ${userDetail.fullname}`}
			/>
			<Avatar.Fallback>{initial}</Avatar.Fallback>
		</Avatar.Root>
		<div>
			<Dialog.Root
				open={dialogOpen}
				onOpenChange={(open) => {
					dialogOpen = open;
					if (!open) {
						avatarName = "";
						URL.revokeObjectURL(avatarUrl);
					}
				}}
			>
				<Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Upload</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Upload Image</Dialog.Title>
						<Dialog.Description>
							Preview and update avatar for user <b>{userDetail.fullname}</b>.
						</Dialog.Description>
					</Dialog.Header>
					{#if $avatarProxy?.[0]}
						<div>
							<img src={avatarUrl} alt="" class="border border-muted" />
							<p class="text-sm leading-tight text-muted-foreground">Preview</p>
						</div>
					{/if}
					<form
						action="?/upload"
						method="POST"
						enctype="multipart/form-data"
						class="flex w-full flex-col gap-2"
						use:enhanceUpload
					>
						<div class="flex w-full flex-row items-center gap-2">
							<Form.Field form={superformUpload} name="avatar" class="grow">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Avatar</Form.Label>
										<Input
											{...props}
											type="file"
											accept="image/*"
											bind:files={$avatarProxy}
											bind:value={avatarName}
											placeholder="Select an image"
										/>
									{/snippet}
								</Form.Control>
								{#if $errorsUpload.avatar}
									<Form.FieldErrors />
								{:else}
									<Form.Description>Upload a new avatar for the user.</Form.Description>
								{/if}
							</Form.Field>

							<Form.Button type="submit">Upload</Form.Button>
						</div>
						{#if $errorsUpload._errors}
							<FormErrors
								message={Object.values($errorsUpload._errors).join(", ")}
								class="w-full justify-start"
							/>
						{/if}
					</form>
				</Dialog.Content>
			</Dialog.Root>
			<AlertDialog.Root open={alertDialogOpen} onOpenChange={(open) => (alertDialogOpen = open)}>
				<AlertDialog.Trigger
					class={buttonVariants({ variant: "destructive", outline: true })}
					disabled={!userDetail.avatar}
				>
					Remove
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<form action="?/deleteAvatar" method="POST" class="contents" use:svelteEnhance>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you sure you want to remove current Avatar?</AlertDialog.Title>
							<AlertDialog.Description class="flex items-center justify-center">
								{#if userDetail.avatar}
									<img
										src="{PUBLIC_R2_URL}/{userDetail.avatar}"
										alt="{userDetail.username} Avatar"
									/>
								{/if}
								<input type="hidden" name="avatarId" value={userDetail.id} />
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="submit" onclick={() => (alertDialogOpen = false)}>
								Continue
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</form>
				</AlertDialog.Content>
			</AlertDialog.Root>
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
			: ''}"
		class="space-y-2"
		use:enhance
	>
		<Card.Content class="space-y-2">
			<Form.Field form={superform} name="fullname">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Full Name</Form.Label>
						<Input
							{...props}
							bind:value={$formData.fullname}
							placeholder="John Doe"
							class={changes.fullname ? changesClass : ""}
						/>
					{/snippet}
				</Form.Control>
				{#if $errors.fullname}
					<Form.FieldErrors />
				{:else}
					<Form.Description>The fullname of the user.</Form.Description>
				{/if}
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
				{#if $errors.username}
					<Form.FieldErrors />
				{:else}
					<Form.Description>Username will be used for login</Form.Description>
				{/if}
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
									captionLayout="dropdown"
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
				{#if $errors.dob}
					<Form.FieldErrors />
				{:else}
					<Form.Description>The date of birth of the user.</Form.Description>
				{/if}
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
								$formData.roleId = roleValue;
								// set timeout to allow the role value to be registered before changing the school value
								setTimeout(() => {
									if (value === Role.enum["super admin"]) {
										$formData.schoolId = "";
									}
								}, 10);
							}}
							name={props.name}
						>
							<Select.Trigger {...props} class={changes.roleId ? changesClass : ""}>
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
										<Select.Item value={role} label={roleTitleCase}>{roleTitleCase}</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				{#if $errors.roleId}
					<Form.FieldErrors />
				{:else}
					<Form.Description>
						Select a role for the user. This will determine their access level.
					</Form.Description>
				{/if}
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
									? data.schoolList.find((school) => school.id.toString() === $formData.schoolId)
											?.name
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
				{#if $errors.schoolId}
					<Form.FieldErrors />
				{:else}
					<Form.Description>
						This will determine the school affiliation of the user.
					</Form.Description>
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
							fullname: userDetail.fullname,
							dob: userDetail.dob,
							username: userDetail.username,
							roleId: currentRole,
							schoolId: currentSchool,
						},
					});
					changes.fullname = false;
					changes.username = false;
					changes.dob = false;
					changes.roleId = false;
					changes.schoolId = false;
				}}>Cancel</Button
			>
			<Form.Button disabled={!isChanged}>Save Changes</Form.Button>
		</Card.Footer>
	</form>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title class="font-display">Change Password</Card.Title>
	</Card.Header>
	<form
		method="POST"
		action="?/changePassword{page.url.searchParams.get('ref')
			? '&ref=' + page.url.searchParams.get('ref')
			: ''}"
		class="space-y-2"
		use:enhancePass
	>
		<Card.Content class="space-y-2">
			<Form.Field form={superFormPass} name="passwordOld">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Old Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formDataPass.passwordOld}
							placeholder="Enter your old password"
						/>
					{/snippet}
				</Form.Control>
				{#if $errorsPass.passwordOld}
					<Form.FieldErrors />
				{:else}
					<Form.Description>Your current Password.</Form.Description>
				{/if}
			</Form.Field>

			<Form.Field form={superFormPass} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formDataPass.password}
							placeholder="Enter your new password"
						/>
					{/snippet}
				</Form.Control>
				{#if $errorsPass.password}
					<Form.FieldErrors />
				{:else}
					<Form.Description>Your new Password.</Form.Description>
				{/if}
			</Form.Field>

			<Form.Field form={superFormPass} name="passwordConfirm">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Confirm New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formDataPass.passwordConfirm}
							placeholder="Confirm your new password"
						/>
					{/snippet}
				</Form.Control>
				{#if $errorsPass.passwordConfirm}
					<Form.FieldErrors />
				{:else}
					<Form.Description>Confirm your new Password.</Form.Description>
				{/if}
			</Form.Field>
		</Card.Content>

		<Card.Footer class="justify-end gap-4">
			{#if $errorsPass._errors}
				<FormErrors message={Object.values($errorsPass._errors).join(", ")} />
			{/if}
			<Button variant="outline" type="reset" onclick={() => resetPass()}>Cancel</Button>
			<Form.Button
				disabled={!$formDataPass.password &&
					!$formDataPass.passwordConfirm &&
					!$formDataPass.passwordOld}>Save Changes</Form.Button
			>
		</Card.Footer>
	</form>
</Card.Root>
