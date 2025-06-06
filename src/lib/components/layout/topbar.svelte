<script lang="ts">
	import { enhance } from "$app/forms";
	import { PUBLIC_R2_URL } from "$env/static/public";

	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	const sidebar = useSidebar();
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { buttonVariants, Button } from "$lib/components/ui/button/index.js";
	import { resetMode, setMode, userPrefersMode } from "mode-watcher";

	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import CircleUser from "@lucide/svelte/icons/circle-user";
	import LogOut from "@lucide/svelte/icons/log-out";
	import UserCog from "@lucide/svelte/icons/user-cog";
	import Contrast from "@lucide/svelte/icons/contrast";

	import { nav } from "$lib/assets/nav/main";

	import type { SessionValidationResult } from "$lib/server/auth";
	import { acronym } from "$lib/utils";

	let { user }: { user: SessionValidationResult["user"] } = $props();
	const initials = acronym(user?.fullname ?? "", 2);

	let alertDialogOpen = $state(false);
</script>

<header
	class={[
		"fixed top-0 left-0 z-1 flex w-full items-center gap-2 border-b bg-background px-4 py-2",
		sidebar.isMobile ? "justify-between" : "justify-end",
	]}
>
	{#if sidebar.isMobile}
		<Sidebar.Trigger class="z-50 h-10 bg-background" />
	{/if}
	<div class="flex items-center gap-2">
		{#if user?.role === 1 || user?.role === 2}
			<Button variant="outline" outline href="/admin"><UserCog />Admin Panel</Button>
		{/if}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" outline size="default" class="py-1" {...props}>
						<Avatar.Root class="h-full w-auto">
							<Avatar.Image src="{PUBLIC_R2_URL}/{user?.avatar}" />
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
						{#snippet child({ props })}
							<a {...props} href="/profile">
								<CircleUser />
								<span>Profile</span>
							</a>
						{/snippet}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => (alertDialogOpen = true)}>
					<LogOut />
					<span>Sign Out</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={buttonVariants({ variant: "outline", size: "icon" })}>
				<MoonIcon
					class={[
						"absolute h-[1.2rem] w-[1.2rem] transition-all",
						userPrefersMode.current === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90",
					]}
				/>
				<SunIcon
					class={[
						" absolute h-[1.2rem] w-[1.2rem] transition-all",
						userPrefersMode.current === "light" ? "scale-100 rotate-0" : "scale-0 rotate-90",
					]}
				/>
				<Contrast
					class={[
						"absolute h-[1.2rem] w-[1.2rem] transition-all",
						userPrefersMode.current === "system" ? "scale-100 rotate-0" : "scale-0 rotate-90",
					]}
				/>

				<span class="sr-only">Toggle theme</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item
					onclick={() => setMode("light")}
					class={userPrefersMode.current === "light"
						? "font-semibold [&_svg:not([class*='text-'])]:text-foreground"
						: ""}><SunIcon />Light</DropdownMenu.Item
				>
				<DropdownMenu.Item
					onclick={() => setMode("dark")}
					class={userPrefersMode.current === "dark"
						? "font-semibold [&_svg:not([class*='text-'])]:text-foreground"
						: ""}><MoonIcon />Dark</DropdownMenu.Item
				>
				<DropdownMenu.Item
					onclick={() => resetMode()}
					class={userPrefersMode.current === "system"
						? "font-semibold [&_svg:not([class*='text-'])]:text-foreground"
						: ""}><Contrast />System</DropdownMenu.Item
				>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>

<AlertDialog.Root open={alertDialogOpen} onOpenChange={(state) => (alertDialogOpen = state)}>
	<AlertDialog.Content>
		<form method="POST" action="/signout?/signout" class="contents" use:enhance>
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
	</AlertDialog.Content>
</AlertDialog.Root>
