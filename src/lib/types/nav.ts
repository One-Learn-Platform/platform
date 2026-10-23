import type { Icon } from "@lucide/svelte";
import type { Path } from "$app/types";

export type NavItem = {
	title: string;
	icon: typeof Icon;
	href: Path;
	superadmin?: boolean;
};
