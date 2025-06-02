<script lang="ts">
	import type { LayoutServerData } from "./$types";
	import type { Snippet } from "svelte";

	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Topbar from "$lib/components/layout/topbar.svelte";
	import AppSidebar from "$lib/components/layout/sidebar.svelte";

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full nth-[2]:pt-12">
		<Topbar user={data.user} />
		{@render children?.()}
	</main>
</Sidebar.Provider>
