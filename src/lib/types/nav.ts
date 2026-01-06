import type { Icon } from "@lucide/svelte";
import type { Pathname } from "$app/types";

export type NavItem = { title: string; icon: typeof Icon; href: Pathname; superadmin?: boolean };
