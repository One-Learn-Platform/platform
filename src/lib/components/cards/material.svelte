<script lang="ts">
	import { page } from "$app/state";

	import type { Material } from "$lib/schema/db";

	import { Button } from "$lib/components/ui/button/index.js";

	const { material }: { material: Material } = $props();
</script>

<Button
	variant="outline"
	class="h-fit max-w-full flex-col items-start text-left"
	href="{page.url.pathname}/material/{material.id}"
>
	<p class="text-xl font-semibold tracking-tight">{material.title}</p>
	<p class="max-w-full text-sm whitespace-normal text-muted-foreground">
		{material.description}
	</p>
</Button>
