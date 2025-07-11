<script lang="ts">
	import { browser } from "$app/environment";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageServerData, PageServerParentData } from "./$types";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import Separator from "$lib/components/ui/separator/separator.svelte";

	import Edit from "@lucide/svelte/icons/edit";
	import Trash from "@lucide/svelte/icons/trash";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";

	import DOMpurify from "dompurify";

	const { data }: { data: PageServerData & PageServerParentData } = $props();
	const attachmentToArray = $derived(JSON.parse(data.material?.attachment || "[]"));
	let dialogOpen = $state(false);
</script>

<div class="flex flex-row items-center justify-between gap-2 *:grow">
	{#if data.user.role === 3}
		<Button variant="outline" href="{data.material?.id}/edit">
			<Edit class="" /> Edit
		</Button>
		<Button variant="destructive" onclick={() => (dialogOpen = true)}>
			<Trash class="" /> Delete Material
		</Button>
	{/if}
</div>
<div class="space-y-1">
	{#if data.material?.thumbnail}
		<div class="">
			<img
				src="{PUBLIC_R2_URL}/{data.material.thumbnail}"
				alt="Thumbnail for {data.material.title}"
				class=""
			/>
		</div>
	{/if}
	{#if data.material?.content}
		{@const sanitizedContent = browser
			? DOMpurify.sanitize(data.material.content)
			: data.material.content}
		<div>
			<p class="text-2xl font-medium tracking-tight">{data.material.title}</p>
			<Separator />
		</div>
		<p class="text-sm text-muted-foreground">{data.material.description}</p>

		<div class="raw">
			{@html sanitizedContent}
		</div>
	{/if}

	{#if attachmentToArray.length > 0}
		<p class="text-sm text-muted-foreground">Attachments:</p>
		{#each attachmentToArray as attachment (attachment)}
			{@const fileCategory = getFileCategory(attachment)}
			{@const fileName = attachment.split("/").pop() || attachment}
			{#if fileCategory === "image"}
				<img src="{PUBLIC_R2_URL}/{attachment}" alt="" class="h-auto w-1/5 max-w-full min-w-xs" />
			{:else}
				{@const FileIcon = getFileIcon(fileCategory)}
				<a
					href="{PUBLIC_R2_URL}/{attachment}"
					target="_blank"
					class="group flex h-fit max-w-28 flex-col items-center gap-1 rounded-xs border p-2"
				>
					<FileIcon class="" />
					<span class="leading-tight break-all text-informative group-hover:underline">
						{fileName}
					</span>
				</a>
			{/if}
		{/each}
	{/if}
</div>

<AlertDialog.Root open={dialogOpen} onOpenChange={(value) => (dialogOpen = value)}>
	<AlertDialog.Content>
		<form action="?/delete" method="POST" class="contents">
			<input type="hidden" name="id" value={data.material?.id} />
			<AlertDialog.Header>
				<AlertDialog.Title>Are you sure you want to delete this material?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently delete <b>{data.material?.title}</b>.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
