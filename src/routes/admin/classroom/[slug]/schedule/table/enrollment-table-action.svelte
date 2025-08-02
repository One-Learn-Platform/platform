<script lang="ts">
	import Copy from "@lucide/svelte/icons/copy";
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import Logs from "@lucide/svelte/icons/logs";
	import { toast } from "svelte-sonner";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	let { id, name }: { id: string; name: string } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: "ghost", class: "relative size-8 p-0" })}>
		<span class="sr-only">Open menu</span>
		<Ellipsis />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>{name}</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onclick={() => {
						navigator.clipboard.writeText(id);
						toast.success("ID copied to clipboard");
					}}
				>
					<Copy class="mr-2 size-4" />
					<span>Copy ID</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					onclick={() => {
						navigator.clipboard.writeText(name);
						toast.success("Name copied to clipboard");
					}}
				>
					<Copy class="mr-2 size-4" />
					<span>Copy Name</span>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a {...props} href="/admin/subject/{id}">
							<Logs class="mr-2 size-4" />
							<span>Subject Detail</span>
						</a>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
