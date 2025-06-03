import { now, today } from "@internationalized/date";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

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

/**
 * Returns a timestamp string in UTC format without slashes or colons.
 *
 * The timestamp is formed by concatenating the current UTC date and time,
 * where the date format has slashes replaced with empty strings,
 * and the time format has colons replaced with empty strings,
 * separated by a hyphen.
 *
 * @example
 * // If today is 2023/05/15 and the time is 14:30:25
 * getTimeStamp() // returns "20230515-143025"
 *
 * @returns {string} A formatted timestamp string in the format "YYYYMMDD-HHMMSS"
 */
export function getTimeStamp() {
	const current = now("UTC");
	const date = today("UTC");

	// Format time components directly
	const hour = current.hour.toString().padStart(2, "0");
	const minute = current.minute.toString().padStart(2, "0");
	const second = current.second.toString().padStart(2, "0");

	return `${date.toString().replaceAll("-", "")}-${hour}${minute}${second}`;
}
