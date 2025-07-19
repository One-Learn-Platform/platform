<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	import type { PageData } from "./$types";
	dayjs.extend(relativeTime);

	import Material from "$lib/components/cards/material.svelte";
	import Forum from "$lib/components/page/forum.svelte";

	import * as Alert from "$lib/components/ui/alert/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import Edit from "@lucide/svelte/icons/edit";
	import ListTodo from "@lucide/svelte/icons/list-todo";
	import Plus from "@lucide/svelte/icons/plus";
	import { toast } from "svelte-sonner";

	import { getFileCategory, getFileIcon } from "$lib/functions/material";
	import DOMpurify from "dompurify";

	let { data }: { data: PageData } = $props();
	const firstMaterial = $derived(data.material[0]);
	const firstMaterialAttachment = $derived(
		firstMaterial?.attachment ? JSON.parse(firstMaterial.attachment) : [],
	);
	const otherMaterials = $derived(data.material.slice(1));
	const unfinishedAssignments = $derived(data.assignment.filter((a) => a.done === 0));

	const assignmentsDueInWeek = $derived(
		unfinishedAssignments.filter((assignment) =>
			dayjs(assignment.dueDate + "Z").isSame(dayjs().add(1, "week"), "week"),
		),
	);
	const assignmentsDueTomorrow = $derived(
		unfinishedAssignments.filter((assignment) =>
			dayjs(assignment.dueDate + "Z").isSame(dayjs().add(1, "day"), "day"),
		),
	);
</script>

<Button
	variant="secondary"
	onclick={() =>
		toast.success("Event has been created", {
			position: "top-center",
			description: "Sunday, December 03, 2023 at 9:00 AM",
			action: {
				label: "Undo",
				onClick: () => console.info("Undo"),
			},
		})}
>
	Toast
</Button>
<section class="flex h-fit flex-col space-y-2">
	{#if assignmentsDueTomorrow.length > 0}
		<Alert.Root variant="destructive" fill="muted">
			<ListTodo />
			<Alert.Title>You have {assignmentsDueTomorrow.length} assignment due tomorrow!</Alert.Title>
			<Alert.Description>Please complete assignments immediately</Alert.Description>
		</Alert.Root>
	{:else if assignmentsDueInWeek.length > 0}
		<Alert.Root variant="warning" fill="muted">
			<ListTodo />
			<Alert.Title>You have {assignmentsDueInWeek.length} assignment(s) due tomorrow</Alert.Title>
			<Alert.Description>Please complete all assignments before the due date</Alert.Description>
		</Alert.Root>
	{:else if unfinishedAssignments.length > 0}
		<Alert.Root variant="informative" fill="muted">
			<ListTodo />
			<Alert.Title>You have unfinished assignments</Alert.Title>
			<Alert.Description>Please complete all assignments before due date</Alert.Description>
		</Alert.Root>
	{/if}
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

<section class="mt-4 h-fit space-y-2">
	<div class="mb-0">
		<div class="flex flex-row items-center justify-between">
			<h2 class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Assignment</h2>
			<Button variant="link" href="{page.url.pathname}/assignments">See All Assignments</Button>
		</div>
	</div>
	<Separator />
	{#if data.user.role === 3}
		<Button variant="outline" class="w-fit" href="{page.url.pathname}/assignments/create">
			<Plus class="" /> Add Assignment
		</Button>
	{/if}
	{#if unfinishedAssignments && unfinishedAssignments.length > 0}
		<ul class="space-y-2">
			{#each unfinishedAssignments as assignment (assignment.id)}
				<li>
					<Button
						variant="outline"
						href="{page.url.pathname}/assignments/{assignment.id}"
						class="h-fit max-h-32 w-full flex-col items-start gap-1 text-left text-xl font-semibold tracking-tight"
					>
						{assignment.title}
						<span
							class="overflow-hidden text-sm font-normal tracking-normal text-ellipsis whitespace-normal text-muted-foreground"
							>{assignment.description}</span
						>
					</Button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No assignments available.</p>
	{/if}
</section>

<section class="mt-4 h-dvh space-y-2">
	<Forum forumList={data.forum} />
</section>
