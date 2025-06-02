<script lang="ts">
	import * as Alert from "$lib/components/ui/alert/index.js";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

	import { cn } from "$lib/utils";

	const { message, class: className }: { message: string; class?: string } = $props();
</script>

<Alert.Root
	variant="destructive"
	muted
	class={cn("flex w-fit items-center justify-end gap-2 [&>svg]:static [&>svg~*]:pl-0", className)}
>
	<TriangleAlert class="size-4 min-w-fit" />
	<Alert.Description>{message}</Alert.Description>
</Alert.Root>
