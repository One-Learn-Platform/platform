<script lang="ts">
	import { ModeWatcher } from "mode-watcher";
	import "@fontsource-variable/outfit";
	import "@fontsource-variable/jetbrains-mono";
	import "../app.css";
	let { children } = $props();

	import { Toaster } from "$lib/components/ui/sonner/index.js";
</script>

<svelte:head>
	<title>One Learn</title>
	<link href="https://api.fontshare.com/" rel="preconnect" />
	<link href="https://api.fontshare.com/v2/css?f[]=switzer@1,2&display=swap" rel="stylesheet" />
</svelte:head>

<ModeWatcher />
<Toaster />
{@render children()}
