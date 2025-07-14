<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { PageData } from "./$types";

	import Material from "$lib/components/cards/material.svelte";
	import Forum from "$lib/components/page/forum.svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import Edit from "@lucide/svelte/icons/edit";
	import Plus from "@lucide/svelte/icons/plus";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";
	import DOMpurify from "dompurify";

	let { data }: { data: PageData } = $props();
	const firstMaterial = $derived(data.material[0]);
	const firstMaterialAttachment = $derived(JSON.parse(firstMaterial?.attachment));
	const otherMaterials = $derived(data.material.slice(1));
</script>

<section class="flex h-fit flex-col space-y-2">
	{#if firstMaterial}
		{@const sanitizedContent = browser
			? DOMpurify.sanitize(firstMaterial.content)
			: firstMaterial.content}

		<div class="space-y-1">
			<div>
				<Button
					variant="link"
					href="{page.url.pathname}/material/{firstMaterial.id}"
					class="p-0 text-2xl font-medium tracking-tight"
				>
					{firstMaterial.title}
				</Button>
				<Separator />
			</div>
			<p class="text-sm text-muted-foreground">{firstMaterial.description}</p>

			<div class="raw">
				{#if firstMaterial.thumbnail}
					<div class="float-right m-1 w-1/3 min-w-xs p-1">
						<img
							src="{PUBLIC_R2_URL}/{firstMaterial.thumbnail}"
							alt="Thumbnail for {firstMaterial.title}"
							class=""
						/>
					</div>
				{/if}
				{@html sanitizedContent}
			</div>

			{#if firstMaterialAttachment.length > 0}
				<p class="text-sm text-muted-foreground">Attachments:</p>
				<div class="flex flex-row flex-wrap items-start gap-2">
					{#each firstMaterialAttachment as attachment (attachment)}
						{@const fileCategory = getFileCategory(attachment)}
						{@const fileName = attachment.split("/").pop() || attachment}
						{#if fileCategory === "image"}
							<img
								src="{PUBLIC_R2_URL}/{attachment}"
								alt=""
								class="h-auto w-1/5 max-w-full min-w-xs"
							/>
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
			{:else}
				<p>No attachments available.</p>
			{/if}
		</div>
		{#if data.user.role === 3}
			<Button
				variant="outline"
				class="w-fit"
				href="{page.url.pathname}/material/{firstMaterial.id}/edit"
			>
				<Edit class="" /> Edit
			</Button>
		{/if}
	{/if}
	{#if data.user.role === 3}
		<Button variant="outline" class="w-fit" href="{page.url.pathname}/material/create">
			<Plus class="" /> Add Material
		</Button>
	{/if}
	{#if otherMaterials.length !== 0}
		<p>Other material:</p>
		{#each otherMaterials as material (material.id)}
			<Material {material} />
		{/each}
	{/if}
</section>

<section class="h-fit space-y-2">
	<div>
		<h2 class="font-display text-2xl font-semibold tracking-tight">Assignment</h2>
		<Separator />
	</div>
	{#if data.user.role === 3}
		<Button variant="outline" class="w-fit" href="{page.url.pathname}/assignments/create">
			<Plus class="" /> Add Assignment
		</Button>
	{/if}
	{#if data.assignment && data.assignment.length > 0}
		<ul class="space-y-2">
			{#each data.assignment as assignment (assignment.id)}
				<li>
					<p class="text-lg font-semibold">{assignment.title}</p>
					<p class="text-sm text-muted-foreground">{assignment.description}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No assignments available.</p>
	{/if}
</section>

<section class="h-dvh space-y-2">
	<Forum forumList={data.forum} />
</section>
