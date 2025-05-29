import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function acronym(name: string, length = 2) {
	return name
		.split(" ")
		.map((name) => name[0])
		.join("")
		.toUpperCase()
		.slice(0, length);
}

export function getFileName(name: string) {
	return name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}

export function getFileExtension(name: string) {
	return name.split(".").slice(-1).join("").toLowerCase();
}
