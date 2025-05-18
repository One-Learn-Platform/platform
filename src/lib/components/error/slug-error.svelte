<script lang="ts">
	import { page } from "$app/state";

	import { Button } from "$lib/components/ui/button/index.js";

	let { href }: { href: string } = $props();
</script>

<svelte:head>
	<title>{page.status}{page.error?.message ? " - " + page.error.message : ""} | One Learn</title>
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 pt-4">
	<section class="space-y-1 text-center">
		<h1 class="font-mono text-6xl font-black md:text-7xl lg:text-8xl xl:text-9xl">
			{page.status}
		</h1>
		<p class="text-2xl font-medium tracking-tight sm:text-3xl lg:text-4xl">
			{page.error?.message}
		</p>
	</section>
<Button variant="outline" href={href} class="text-base">Home</Button>
</div>
