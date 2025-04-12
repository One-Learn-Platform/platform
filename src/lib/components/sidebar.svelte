<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import House from "@lucide/svelte/icons/house";
	import Inbox from "@lucide/svelte/icons/inbox";
	import Search from "@lucide/svelte/icons/search";
	import Settings from "@lucide/svelte/icons/settings";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { User, School, ChartArea } from "@lucide/svelte";

	// Menu items.
	const items = [
		{
			title: "Statistic",
			url: "/statisitc",
			icon: ChartArea,
		},
		{
			title: "User",
			url: "/user",
			icon: User,
		},
		{
			title: "School",
			url: "/school",
			icon: School,
		},
		{
			title: "Search",
			url: "/search",
			icon: Search,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: Settings,
		},
	];
</script>

<Sidebar.Root variant="floating" collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Management</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Trigger class="z-50 h-8 w-full" />
</Sidebar.Root>
