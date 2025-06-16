<script lang="ts">
	import { PUBLIC_R2_URL } from "$env/static/public";
	import type { Forum } from "$lib/schema/db";
	import { browser } from "$app/environment";
	import { page } from "$app/state";

	import Dompurify from "dompurify";
	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import { acronym } from "$lib/utils";

	let { forum }: { forum: Forum & { fullname: string | null; avatar: string | null } } = $props();
	let sanitizedDescription = $state(
		browser ? Dompurify.sanitize(forum.description) : forum.description,
	);
	const initial = $derived(acronym(forum.fullname ?? "ID"));
	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	});
	const localeDate = $derived(new Date(forum.createdAt + "Z"));
</script>

<a
	href="{page.url.pathname}/forum/{forum.id}"
	class="flex h-fit flex-col gap-2 rounded-sm border bg-background p-4 duration-150 hover:bg-muted hover:shadow-xs"
>
	<div class="">
		<h2 class="text-xl font-semibold tracking-tight">{forum.title}</h2>
		<Separator class="w-fit" />
		<div class="h-20 max-w-full overflow-clip bg-transparent text-muted-foreground [&_p]:truncate">
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
