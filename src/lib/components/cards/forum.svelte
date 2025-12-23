<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { Forum } from "$lib/schema/db";

	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	import Dompurify from "dompurify";
	dayjs.extend(relativeTime);

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import { acronym } from "$lib/utils";

	let {
		forum,
	}: { forum: Forum & { fullname: string; avatar: string | null; subjectCode: string } } = $props();

	const sanitizedDescription = $derived.by(() => {
		if (!forum?.description) return "";

		try {
			let content = forum.description;
			content = content.replace(/<a[^>]*>/gi, "<span>").replace(/<\/a>/gi, "</span>");
			if (browser) {
				content = Dompurify.sanitize(content, {
					RETURN_DOM: false,
					RETURN_DOM_FRAGMENT: false,
				});
			}

			return content;
		} catch (error) {
			console.error("Error processing description:", error);
			return "";
		}
	});

	const initial = $derived(acronym(forum.fullname));
	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
	const localeDate = $derived(new Date(forum.createdAt + "Z"));
</script>

<a
	href={resolve(`/subject/${forum.subjectCode}/${forum.chapter}/forum/${forum.id}`)}
	class="flex h-fit flex-col gap-2 rounded-sm border bg-background p-4 duration-150 hover:bg-muted hover:shadow-xs"
>
	<div class="">
		<h2 class="text-xl font-semibold tracking-tight">{forum.title}</h2>
		<Separator class="w-fit" />
		<div
			class="raw h-20 max-w-full overflow-clip bg-transparent text-muted-foreground [&_p]:truncate"
		>
			{@html sanitizedDescription}
		</div>
	</div>
	<div class="flex flex-row items-center gap-2 text-sm">
		<Avatar.Root class="size-6">
			<Avatar.Image src="{PUBLIC_R2_URL}/{forum.avatar}" alt={forum.fullname} />
			<Avatar.Fallback>{initial}</Avatar.Fallback>
		</Avatar.Root>
		<p class="grow truncate font-medium">{forum.fullname}</p>
		<p class="min-w-fit text-sm tracking-tight text-muted-foreground">
			{dateFormatter.format(localeDate)} |
			<span class="font-medium">{dayjs(localeDate).fromNow()} </span>
		</p>
	</div>
</a>
