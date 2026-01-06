<script lang="ts">
	import { resolve } from "$app/paths";
	import { enhance } from "$app/forms";
	import type { NavItem } from "$lib/types/nav";

	import { page } from "$app/state";
	import { PUBLIC_R2_URL } from "$env/static/public";
	import { resetMode, setMode, userPrefersMode } from "mode-watcher";

	import type { SessionValidationResult } from "$lib/server/auth";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";

	import { appNav } from "$lib/assets/nav/app";
	import { acronym } from "$lib/utils";

	import BadgeInfo from "@lucide/svelte/icons/badge-info";
	import BookCopy from "@lucide/svelte/icons/book-copy";
	import BookMarked from "@lucide/svelte/icons/book-marked";
	import ChartArea from "@lucide/svelte/icons/chart-area";
	import ChartCandlestick from "@lucide/svelte/icons/chart-candlestick";
	import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
	import CircleUser from "@lucide/svelte/icons/circle-user";
	import Contrast from "@lucide/svelte/icons/contrast";
	import LogOut from "@lucide/svelte/icons/log-out";
	import MessagesSquare from "@lucide/svelte/icons/messages-square";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import School from "@lucide/svelte/icons/school";
	import SunIcon from "@lucide/svelte/icons/sun";
	import User from "@lucide/svelte/icons/user";
	import UserCog from "@lucide/svelte/icons/user-cog";

	const sidebar = useSidebar();
	const prefix = "/admin";
	// Menu items.
	const overview: NavItem[] = [
		{
			title: "Statistic",
			href: `${prefix}`,
			icon: ChartArea,
			superadmin: false,
		},
	];

	const management: NavItem[] = [
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
			title: "Grade",
			href: `${prefix}/grades`,
			icon: ChartCandlestick,
			superadmin: true,
		},
		{
			title: "Subject",
			href: `${prefix}/subject`,
			icon: BookMarked,
			superadmin: false,
		},
		{
			title: "Subject Type",
			href: `${prefix}/subject-type`,
			icon: BookCopy,
			superadmin: true,
		},
		{
			title: "Forum",
			href: `${prefix}/forum`,
			icon: MessagesSquare,
			superadmin: false,
		},
		{
			title: "Announcement",
			href: `${prefix}/announcement`,
			icon: BadgeInfo,
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
												<a href={resolve(item.href)} {...props}>
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
											<a href={resolve(item.href)} {...props}>
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
			<DropdownMenu.Trigger class={buttonVariants({ variant: "outline", size: "default" })}>
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
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
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
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="border">
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image src="{PUBLIC_R2_URL}/{user?.avatar}" alt={user?.fullname} />
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
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image src="{PUBLIC_R2_URL}/{user?.avatar}" alt={user?.fullname} />
							<Avatar.Fallback class="rounded-lg">{initial}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{user?.fullname}</span>
							<span class="truncate text-xs">{user?.username}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				{#if role !== 1}
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						{#each appNav as item (item.href)}
							{@const Icon = item.icon}
							<DropdownMenu.Item class="cursor-pointer">
								{#snippet child({ props })}
									<a {...props} href={resolve(item.href)}>
										<Icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
				{/if}
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="cursor-pointer">
						{#snippet child({ props })}
							<a {...props} href={resolve(role === 1 ? "/admin/profile" : "/profile")}>
								<CircleUser />
								<span>Profile</span>
							</a>
						{/snippet}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					class="cursor-pointer"
					onclick={() => (alertDialogOpen = true)}
					variant="destructive"
				>
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
		<form method="POST" action="/signout?/signout" class="contents" use:enhance>
			<AlertDialog.Header>
				<AlertDialog.Description class="flex items-center gap-2">
					<Avatar.Root class="">
						<Avatar.Image src="{PUBLIC_R2_URL}/{user?.avatar}" />
						<Avatar.Fallback>{initial ?? "ID"}</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex flex-col">
						<p class="text-base font-medium text-accent-foreground">{user?.fullname}</p>
						<p class="text-xs">{user?.username}</p>
					</div>
				</AlertDialog.Description>
				<AlertDialog.Title>Sign out from this account?</AlertDialog.Title>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel class="grow" type="reset">No</AlertDialog.Cancel>
				<AlertDialog.Action class="grow" type="submit">Yes</AlertDialog.Action>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
