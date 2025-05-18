<script lang="ts">
	import { page } from "$app/state";

	import { Button } from "$lib/components/ui/button/index.js";
</script>

<svelte:head>
	<title>{page.status}{page.error?.message ? " - " + page.error.message : ""} | One Learn</title>
</svelte:head>

<main class="flex h-screen w-full flex-col items-center justify-center gap-4 pt-8">
	<section class="space-y-1 text-center">
		<h1 class="font-mono text-6xl font-black md:text-7xl lg:text-8xl xl:text-9xl">
			{page.status}
		</h1>
		<p class="text-3 xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
			{page.error?.message}
		</p>
	</section>
	<Button variant="outline" href="/" class="text-base">Home</Button>
</main>
