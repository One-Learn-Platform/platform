<script lang="ts">
	import { page } from "$app/state";

	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	import Search from "@lucide/svelte/icons/search";
	import Settings from "@lucide/svelte/icons/settings";
	import User from "@lucide/svelte/icons/user";
	import School from "@lucide/svelte/icons/school";
	import ChartArea from "@lucide/svelte/icons/chart-area";
	import UserCog from "@lucide/svelte/icons/user-cog";

	const prefix = "/admin";
	// Menu items.
	const overview = [
		{
			title: "Statistic",
			url: `${prefix}`,
			icon: ChartArea,
			superadmin: false,
		},
		{
			title: "Search",
			url: `${prefix}/search`,
			icon: Search,
			superadmin: false,
		},
		{
			title: "Settings",
			url: `${prefix}/settings`,
			icon: Settings,
			superadmin: false,
		},
	];

	const management = [
		{
			title: "User",
			url: `${prefix}/user`,
			icon: User,
			superadmin: false,
		},
		{
			title: "Role",
			url: `${prefix}/role`,
			icon: UserCog,
			superadmin: true,
		},
		{
			title: "School",
			url: `${prefix}/school`,
			icon: School,
			superadmin: true,
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

	let { role }: { role?: number } = $props();
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
										<Sidebar.MenuButton isActive={item.url === page.url.pathname}>
											{#snippet child({ props })}
												<a href={item.url} {...props}>
													<item.icon />
													<span>{item.title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								{/if}
							{:else}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={item.url === page.url.pathname}>
										{#snippet child({ props })}
											<a href={item.url} {...props}>
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
	<Sidebar.Trigger class="z-50 h-10 w-full" />
</Sidebar.Root>
