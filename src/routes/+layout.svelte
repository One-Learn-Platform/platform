<script lang="ts">
	import { ModeWatcher } from "mode-watcher";
	import { configure } from "onedollarstats";
	import { onMount } from "svelte";

	import "@fontsource-variable/outfit";
	import "@fontsource-variable/jetbrains-mono";
	import "../app.css";

	import { Toaster } from "$lib/components/ui/sonner/index.js";

	let { children } = $props();

	onMount(() => {
		configure({ trackLocalhostAs: "onelearn.id" });
	});
</script>

<svelte:head>
	<title>One Learn</title>
	<link href="https://api.fontshare.com/" rel="preconnect" />
	<link href="https://api.fontshare.com/v2/css?f[]=switzer@1,2&display=swap" rel="stylesheet" />
	<meta name="theme-color" content="#f54900" />
</svelte:head>

<ModeWatcher />
<Toaster />
{@render children()}
