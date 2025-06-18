import type { BadgeVariant } from "$lib/components/ui/badge";

/**
 * Generates a 3-character abbreviation from a subject type name by converting it to uppercase
 * and taking the first 3 characters.
 *
 * @param subject - The subject name to abbreviate
 * @returns A 3-character uppercase abbreviation of the subject name
 *
 * @example
 * ```typescript
 * subjectAbbreviation("laboratory") // returns "LAB"
 * ```
 */
export function subjectAbbreviation(subject: string) {
	return subject.toLocaleUpperCase().slice(0, 3);
}

/**
 * Returns the appropriate badge variant based on the subject type.
 *
 * @param subject - The subject string to determine the color for
 * @param muted - Whether to return a muted variant of the color (defaults to false)
 *
 * @returns The badge variant corresponding to the subject type:
 *   - "informative" or "informative_muted" for "laboratory"
 *   - "success" or "success_muted" for "lesson"
 *   - "interactive" or "interactive_muted" for "practicum"
 *   - "outline" for any other subject
 */
export function subjectColor(subject: string, muted: boolean = false): BadgeVariant {
	const subjectLower = subject.toLowerCase();
	switch (subjectLower) {
		case "laboratory":
			return muted ? "informative_muted" : "informative";
		case "lesson":
			return muted ? "success_muted" : "success";
		case "practicum":
			return muted ? "interactive_muted" : "interactive";
		default:
			return "outline";
	}
}

export function subjectBgColor(subject: string, muted: boolean = false): string {
	const subjectLower = subject.toLowerCase();
	switch (subjectLower) {
		case "laboratory":
			return muted ? "bg-informative-muted" : "bg-informative";
		case "lesson":
			return muted ? "bg-success-muted" : "bg-success";
		case "practicum":
			return muted ? "bg-interactive-muted" : "bg-interactive";
		default:
			return "bg-outline";
	}
}
