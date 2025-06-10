<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LayoutServerData } from "./$types";

	import AppSidebar from "$lib/components/layout/sidebar.svelte";
	import Topbar from "$lib/components/layout/topbar.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
</script>

<div class="[--header-height:calc(--spacing(14))]">
	<Sidebar.Provider class="flex flex-col">
		<Topbar user={data.user} />
		<div class="flex flex-1">
			<AppSidebar />
			<Sidebar.Inset>
				<div class="w-full nth-[2]:pt-12">
					<main class="space-y-2 px-2 pt-2 pr-4 pb-2">
						{@render children?.()}
					</main>
				</div>
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>
</div>
