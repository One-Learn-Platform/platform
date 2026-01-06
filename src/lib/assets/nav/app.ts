import type { Pathname } from "$app/types";
import type { NavItem } from "$lib/types/nav";

import type { Icon } from "@lucide/svelte";
import BookMarked from "@lucide/svelte/icons/book-marked";
import ClipboardList from "@lucide/svelte/icons/clipboard-list";
import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import Megaphone from "@lucide/svelte/icons/megaphone";
import MessagesSquare from "@lucide/svelte/icons/messages-square";

export const appNav: NavItem[] = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		href: "/dashboard",
	},
	{
		title: "Subject",
		icon: BookMarked,
		href: "/subject",
	},
	{
		title: "Forum",
		icon: MessagesSquare,
		href: "/forum",
	},
	{
		title: "Assignments",
		icon: ClipboardList,
		href: "/assignments",
	},
	{
		title: "Announcements",
		icon: Megaphone,
		href: "/announcements",
	},
];
