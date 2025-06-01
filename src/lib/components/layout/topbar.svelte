<script lang="ts">
	import { enhance } from "$app/forms";

	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { buttonVariants, Button } from "$lib/components/ui/button/index.js";

	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import CircleUser from "@lucide/svelte/icons/circle-user";
	import LogOut from "@lucide/svelte/icons/log-out";

	import { nav } from "$lib/assets/nav/main";

	import type { SessionValidationResult } from "$lib/server/auth";
	import { acronym } from "$lib/utils";

	let { user }: { user: SessionValidationResult["user"] } = $props();
	const initials = acronym(user?.fullname ?? "", 2);

	let alertDialogOpen = $state(false);
</script>

<header class="flex w-full items-center justify-end border-b bg-white px-4 py-1">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: "default", outline: true })}>
			{#snippet child({ props })}
				<Button variant="outline" size="sm" class="py-1" {...props}>
					<Avatar.Root class="h-full w-auto">
						<Avatar.Image src={user?.avatar ?? undefined} />
						<Avatar.Fallback>{initials ?? "ID"}</Avatar.Fallback>
					</Avatar.Root>
					{user?.fullname ?? "User"}
					<ChevronDown />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Group>
				{#each nav as item (item.title)}
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<a href={item.href} {...props}>
								<item.icon />
								{item.title}
							</a>
						{/snippet}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Group>
			<DropdownMenu.Separator />

			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<CircleUser />
					Profile
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => (alertDialogOpen = true)}>
				<LogOut />
				<span>Sign Out</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</header>

<AlertDialog.Root open={alertDialogOpen} onOpenChange={(state) => (alertDialogOpen = state)}>
	<AlertDialog.Content>
		{#snippet child({ props })}
			<form {...props} method="POST" action="/signout?/signout" use:enhance>
				<AlertDialog.Header>
					<AlertDialog.Description class="flex items-center gap-2">
						<Avatar.Root class="">
							<Avatar.Image src={user?.avatar ?? undefined} />
							<Avatar.Fallback>{initials ?? "ID"}</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex flex-col">
							<p class="text-base font-medium text-accent-foreground">{user?.fullname}</p>
							<p class="text-xs">{user?.username}</p>
						</div>
					</AlertDialog.Description>
					<AlertDialog.Title>Log out from this account?</AlertDialog.Title>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel class="grow" type="reset">No</AlertDialog.Cancel>
					<AlertDialog.Action class="grow" type="submit">Yes</AlertDialog.Action>
				</AlertDialog.Footer>
			</form>
		{/snippet}
	</AlertDialog.Content>
</AlertDialog.Root>
