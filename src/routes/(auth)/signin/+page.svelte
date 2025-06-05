<script lang="ts">
	import { PUBLIC_R2_URL, PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
	import { Turnstile } from "svelte-turnstile";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import type { ActionData, PageServerData } from "./$types";
	import { formSchema } from "./schema";

	import { acronym } from "$lib/utils";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import FormErrors from "$lib/components/error/form-errors.svelte";

	import logo from "$lib/assets/logo.svg";
	import backdrop from "$lib/assets/pattern.png?enhanced";

	let { form, data }: { form: ActionData; data: PageServerData } = $props();
	const initial = $derived(acronym(data?.user?.username ?? "ID"));

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zodClient(formSchema),
	});
	const { form: formData, enhance, errors: formErrors } = superform;
</script>

<main class="flex h-screen flex-col items-center justify-center gap-8 md:flex-row md:gap-0">
	<div class="h-1/4 min-h-1/4 w-full md:h-full md:w-1/2 md:min-w-1/2">
		<enhanced:img src={backdrop} class="h-full w-full object-cover" alt="" />
	</div>
	<form
		method="POST"
		action="?/signin"
		class="flex h-full w-full grow flex-col items-center justify-start gap-4 px-8 sm:px-10 md:w-auto md:justify-center md:px-12 lg:px-20"
		use:enhance
	>
		<img src={logo} alt="Logo" class="w-1/3" />
		<h1
			class="self-start font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
		>
			Sign In
		</h1>
		<div class="w-full space-y-1">
			{#if data && data.user}
				<p>Currently signed in as</p>
				<div
					class="flex w-full flex-row items-center justify-between gap-2 rounded-md border p-2 shadow-sm"
				>
					<Avatar.Root>
						<Avatar.Image src="{PUBLIC_R2_URL}/{data.user?.avatar}" />
						<Avatar.Fallback>{initial ?? "ID"}</Avatar.Fallback>
					</Avatar.Root>
					<p class="grow truncate font-medium">{data.user?.username}</p>
					<Button
						href="/"
						size="sm"
						variant="outline"
						class="h-auto w-auto self-stretch justify-self-end text-sm"
					>
						Continue
					</Button>
				</div>
			{/if}
		</div>
		<div class="flex w-full flex-col gap-2">
			<Form.Field form={superform} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input {...props} bind:value={$formData.username} placeholder="Enter your username" />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superform} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Password</Form.Label>
						<Input
							{...props}
							bind:value={$formData.password}
							placeholder="Enter your password"
							type="password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="leading-none">
				<Turnstile
					siteKey={PUBLIC_TURNSTILE_SITE_KEY}
					size="flexible"
					appearance="always"
				/>
			</div>
			{#if $formErrors._errors}
				<!-- <FormErrors
					message="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum minus recusandae, voluptas quo aut consequuntur quis voluptatum dolorem ipsa earum nobis voluptate consequatur nesciunt, sapiente, saepe distinctio reprehenderit soluta asperiores."
					class=""
				/> -->
				<FormErrors
					message={Object.values($formErrors._errors).join(", ")}
					class="w-full justify-start"
				/>
			{/if}
			<Button type="submit" size="default" class="w-full text-base">Sign In</Button>
		</div>
	</form>
</main>
