<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData, PageServerData } from "./$types";
	import { PUBLIC_R2_URL, PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
	import { Turnstile } from "svelte-turnstile";

	import { clsx } from "clsx";
	import { acronym } from "$lib/utils";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";

	import backdrop from "$lib/assets/pattern.png?enhanced";
	import logo from "$lib/assets/logo.svg";

	let { form, data }: { form: ActionData; data: PageServerData } = $props();
	const errorUsername = $derived(form?.message?.includes("username"));
	const errorPassword = $derived(form?.message?.includes("password"));
	const initial = $derived(acronym(data?.user?.username ?? "ID"));
</script>

<main class="flex h-screen items-center justify-center">
	<div class="h-full w-1/2">
		<enhanced:img src={backdrop} class="h-full w-full object-cover" alt="" />
	</div>
	<form
		method="POST"
		action="?/signin"
		class="flex h-full w-full grow flex-col items-center justify-center gap-4 px-8 sm:px-10 md:w-auto md:px-12 lg:px-20"
		use:enhance
	>
		<img src={logo} alt="Logo" class="w-1/3" />
		<h1
			class="self-start font-display text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
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
					<p class="grow font-medium">{data.user?.username}</p>
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
			<div
				class={clsx(
					errorUsername ? "text-red-500 *:border-red-500 *:!ring-red-500" : "",
					"flex flex-col gap-1",
				)}
			>
				<Label for="username">Username</Label>
				<Input type="text" name="username" id="username" class="" />
			</div>

			<div
				class={clsx(
					errorPassword ? "text-red-500 *:border-red-500 *:!ring-red-500" : "",
					"flex flex-col gap-1",
				)}
			>
				<Label for="password">Password</Label>
				<Input type="password" name="password" id="password" />
			</div>
			{#if form?.message}
				<p class="text-xs text-red-500">
					{form.message}
				</p>
			{/if}
			<div class="leading-none">
				<Turnstile
					siteKey={PUBLIC_TURNSTILE_SITE_KEY}
					size="flexible"
					appearance="interaction-only"
				/>
				{#if form?.captcha}
					<p class="text-xs text-red-500">
						{form.captcha}
					</p>
				{/if}
			</div>
			<Button type="submit" size="default" class="w-full text-base">Sign In</Button>
		</div>
	</form>
</main>
