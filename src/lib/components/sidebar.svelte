<script lang="ts">
	import { page } from "$app/state";
	import { enhance } from "$app/forms";

	import type { SessionValidationResult } from "$lib/server/auth";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";

	import { nav } from "$lib/assets/nav/main";
	import { acronym } from "$lib/utils";

	import ChartArea from "@lucide/svelte/icons/chart-area";
	import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
	import CircleUser from "@lucide/svelte/icons/circle-user";
	import LogOut from "@lucide/svelte/icons/log-out";
	import School from "@lucide/svelte/icons/school";
	import Search from "@lucide/svelte/icons/search";
	import Settings from "@lucide/svelte/icons/settings";
	import User from "@lucide/svelte/icons/user";
	import BookMarked from "@lucide/svelte/icons/book-marked";
	import UserCog from "@lucide/svelte/icons/user-cog";

	const sidebar = useSidebar();
	const prefix = "/admin";
	// Menu items.
	const overview = [
		{
			title: "Statistic",
			href: `${prefix}`,
			icon: ChartArea,
			superadmin: false,
		},
		{
			title: "Search",
			href: `${prefix}/search`,
			icon: Search,
			superadmin: false,
		},
		{
			title: "Settings",
			href: `${prefix}/settings`,
			icon: Settings,
			superadmin: false,
		},
	];

	const management = [
		{
			title: "User",
			href: `${prefix}/user`,
			icon: User,
			superadmin: false,
		},
		{
			title: "Role",
			href: `${prefix}/role`,
			icon: UserCog,
			superadmin: true,
		},
		{
			title: "School",
			href: `${prefix}/school`,
			icon: School,
			superadmin: true,
		},
		{
			title: "Subject",
			href: `${prefix}/subject`,
			icon: BookMarked,
			superadmin: false,
		},
	];

	const categories = [
		{
			title: "Overview",
			items: overview,
		},
		{
			title: "Management",
			items: management,
		},
	];

	let { role, user }: { role?: number; user: SessionValidationResult["user"] } = $props();
	const initial = $derived(acronym(user?.fullname ?? "ID"));
	let alertDialogOpen = $state(false);
</script>

<Sidebar.Root variant="floating" collapsible="icon">
	<Sidebar.Content>
		{#each categories as category (category.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{category.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each category.items as item (item.title)}
							{#if role !== 1}
								{#if !item.superadmin}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton
											isActive={category.title === "Overview"
												? page.url.pathname === item.href
												: page.url.pathname.startsWith(item.href)}
										>
											{#snippet child({ props })}
												<a href={item.href} {...props}>
													<item.icon />
													<span>{item.title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								{/if}
							{:else}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										isActive={category.title === "Overview"
											? page.url.pathname === item.href
											: page.url.pathname.startsWith(item.href)}
									>
										{#snippet child({ props })}
											<a href={item.href} {...props}>
												<item.icon />
												<span>{item.title}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/if}
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="border">
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image src={user?.avatar} alt={user?.fullname} />
							<Avatar.Fallback class="rounded-lg">{initial}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{user?.fullname}</span>
							<span class="truncate text-xs">{user?.username}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[var(--bits-dropdown-menu-anchor-width)] min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image src={user?.avatar} alt={user?.fullname} />
							<Avatar.Fallback class="rounded-lg">{initial}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{user?.fullname}</span>
							<span class="truncate text-xs">{user?.username}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					{#each nav as item (item.href)}
						{@const Icon = item.icon}
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a {...props} href={item.href}>
									<Icon />
									<span>{item.title}</span>
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
	</Sidebar.Footer>
	<Sidebar.Trigger class="z-50 h-10 w-full" />
</Sidebar.Root>

<AlertDialog.Root open={alertDialogOpen} onOpenChange={(state) => (alertDialogOpen = state)}>
	<AlertDialog.Content>
		{#snippet child({ props })}
			<form {...props} method="POST" action="/signout?/signout" use:enhance>
				<AlertDialog.Header>
					<AlertDialog.Description class="flex items-center gap-2">
						<Avatar.Root class="">
							<Avatar.Image src={user?.avatar ?? undefined} />
							<Avatar.Fallback>{initial ?? "ID"}</Avatar.Fallback>
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
