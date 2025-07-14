import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import BookMarked from "@lucide/svelte/icons/book-marked";
import MessagesSquare from "@lucide/svelte/icons/messages-square";
import ClipboardList from "@lucide/svelte/icons/clipboard-list";
import Megaphone from "@lucide/svelte/icons/megaphone";
import ChartArea from "@lucide/svelte/icons/chart-area";

export const appNav = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		href: "/",
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
		title: "Leaderboard",
		icon: ChartArea,
		href: "/leaderboard",
	},
	{
		title: "Announcements",
		icon: Megaphone,
		href: "/announcements",
	},
];
