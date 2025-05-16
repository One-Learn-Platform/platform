<script lang="ts">
	import type { LayoutServerData } from "./$types";
	import type { Snippet } from "svelte";

	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/sidebar.svelte";

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
	let role = data.user?.role ?? 1; //temporary placeholder
	const user = data.user;
</script>

<svelte:head>
	<title>Admin | One Learn</title>
</svelte:head>

<Sidebar.Provider>
	<AppSidebar {role} {user} />
	<main class="w-full py-2">
		{@render children?.()}
	</main>
</Sidebar.Provider>
