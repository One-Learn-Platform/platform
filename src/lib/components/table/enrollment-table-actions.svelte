<script lang="ts">
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import Pencil from "@lucide/svelte/icons/pencil";
	import UserPen from "@lucide/svelte/icons/user-pen";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	let { id, name, href }: { id: string; name: string; href: string } = $props();
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
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a {...props} href="/admin/subject/{id}">
							<Pencil class="mr-2 size-4" />
							<span>Edit Subject</span>
						</a>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a {...props} href="{href}/{id}">
							<UserPen class="mr-2 size-4" />
							<span>Edit Enrollment</span>
						</a>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
