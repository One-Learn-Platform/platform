<script lang="ts">
	import { enhance } from "$app/forms";

	import { toast } from "svelte-sonner";
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import Trash from "@lucide/svelte/icons/trash";
	import Pencil from "@lucide/svelte/icons/pencil";
	import Copy from "@lucide/svelte/icons/copy";
	import Logs from "@lucide/svelte/icons/logs";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

	let openDialog = $state(false);

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
						<a {...props} href="{href}/{id}">
							<Logs class="mr-2 size-4" />
							<span>Detail</span>
						</a>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a {...props} href="{href}/{id}?ref=table">
							<Pencil class="mr-2 size-4" />
							<span>Edit</span>
						</a>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.Item
					class="data-highlighted:text-destructive-foreground w-full data-highlighted:bg-destructive"
					onclick={() => (openDialog = true)}
				>
					<Trash class="mr-2 size-4" />
					<span>Delete</span>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<AlertDialog.Root bind:open={openDialog}>
	<AlertDialog.Content>
		<form class="contents" action="?/delete" method="POST" use:enhance>
			<AlertDialog.Header>
				<AlertDialog.Title>Do you want to delete {name}?</AlertDialog.Title>
				<AlertDialog.Description>
					<input type="hidden" name="id" value={id} />
					This action is irreversible. Are you sure you want to delete {name}?
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit" onclick={() => (openDialog = false)}>
					Delete
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
