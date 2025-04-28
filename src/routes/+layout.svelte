<script lang="ts">
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	// import "@fontsource-variable/outfit";
	import "@fontsource-variable/jetbrains-mono";
	import "../app.css";
	let { children } = $props();

	import { Toaster } from "$lib/components/ui/sonner/index.js";
</script>

<svelte:head>
	<link href="https://api.fontshare.com/" rel="preconnect" />
	<link href="https://api.fontshare.com/v2/css?f[]=outfit@1&display=swap" rel="stylesheet" />
	<link href="https://api.fontshare.com/v2/css?f[]=switzer@1,2&display=swap" rel="stylesheet" />
</svelte:head>

<ParaglideJS {i18n}>
	<Toaster />
	{@render children()}
</ParaglideJS>
