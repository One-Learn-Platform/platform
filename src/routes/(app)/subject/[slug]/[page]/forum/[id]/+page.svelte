<script lang="ts">
	import type { PageServerData } from "./$types";
	import { PUBLIC_R2_URL } from "$env/static/public";

	import Dompurify from "dompurify";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { superForm } from "sveltekit-superforms";
	import { formSchema } from "./schema";

	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Form from "$lib/components/ui/form/index.js";

	import { acronym } from "$lib/utils";

	let { data }: { data: PageServerData } = $props();

	const superform = superForm(data.form, {
		taintedMessage: null,
		validators: zod4Client(formSchema),
	});
	const { form: formData, enhance, errors: formErrors, reset } = superform;

	const initials = acronym(data.forum.fullname ?? "ID");
	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
	const localeDate = $derived(new Date(data.forum.createdAt + "Z"));
</script>

<svelte:head>
	<title>{data.forum.title} | OneLearn</title>
</svelte:head>

<h1 class="font-display text-5xl font-semibold tracking-tight">View Forum</h1>
<Separator />

<Card.Root>
	<Card.Header>
		<Card.Title class="text-4xl tracking-tight">{data.forum.title}</Card.Title>
		<Card.Description>{dateFormatter.format(localeDate)}</Card.Description>
		<Separator />
	</Card.Header>
	<Card.Content>
		<div class="raw max-w-full **:break-words **:whitespace-break-spaces">
			{@html Dompurify.sanitize(data.forum.description)}
		</div>
	</Card.Content>
	<Separator />
	<Card.Footer class="flex items-center gap-2">
		<Avatar.Root>
			<Avatar.Image src="{PUBLIC_R2_URL}/{data.forum.avatar}" alt={data.forum.fullname} />
			<Avatar.Fallback>{initials}</Avatar.Fallback>
		</Avatar.Root>
		<span class="truncate font-medium">
			{data.forum.fullname}
		</span>
	</Card.Footer>
</Card.Root>
<Separator />

<form action="?/comment" method="POST" use:enhance>
	<Form.Field form={superform} name="content">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Content</Form.Label>
				<Input {...props} />
			{/snippet}
		</Form.Control>
		{#if $formErrors.content}
			<Form.FieldErrors />
		{:else}
			<Form.Description>This is the content of the comment</Form.Description>
		{/if}
	</Form.Field>
</form>

<style>
	@reference "tailwindcss";
	:global(.raw h1) {
		@apply text-3xl font-semibold tracking-tight;
	}
	:global(.raw h2) {
		@apply text-2xl font-semibold tracking-tight;
	}
	:global(.raw h3) {
		@apply text-xl font-semibold tracking-tight;
	}
	:global(.raw h4) {
		@apply text-lg font-semibold tracking-tight;
	}
	:global(.raw p) {
		@apply text-base;
	}
</style>
