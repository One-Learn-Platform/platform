<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/sidebar.svelte";

	let { children } = $props();
</script>

<Sidebar.Provider>
  <AppSidebar />
	<main>
		<div class="px-px py-2">
		</div>
		{@render children?.()}
	</main>
</Sidebar.Provider>
