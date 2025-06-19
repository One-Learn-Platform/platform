<script lang="ts">
	import { browser } from "$app/environment";
	import type { PageServerData } from "./$types";
	import { PUBLIC_R2_URL } from "$env/static/public";

	import Separator from "$lib/components/ui/separator/separator.svelte";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";

	import DOMpurify from "dompurify";

	const { data }: { data: PageServerData } = $props();
	const attachmentToArray = $derived(JSON.parse(data.material?.attachment || "[]"));
</script>

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
</div>
