import type { BadgeVariant } from "$lib/components/ui/badge";
import {
	Atom,
	BookUser,
	Calculator,
	CarFront,
	CircleDollarSign,
	Clapperboard,
	Computer,
	Dna,
	Drama,
	Dumbbell,
	FlaskConical,
	HeartPulse,
	Languages,
	Microscope,
	Palette,
	PillBottle,
	Scale,
	Shapes,
	UsersRound,
} from "@lucide/svelte";

export function subjectIcon(name: string) {
	const nameLower = name.toLocaleLowerCase();
	const bio = new Set(["biology", "biological", "bio", "biologi"]);
	const chem = new Set(["chemistry", "chemical", "chem", "kimia"]);
	const physics = new Set(["physics", "physical", "phys", "fisika"]);
	const science = new Set(["science", "scientific", "sains", "ilmu pengetahuan alam", "ipa"]);
	const history = new Set(["history", "historical", "sejarah"]);
	const languages = new Set([
		"language",
		"languages",
		"bahasa",
		"bahasa indonesia",
		"english",
		"inggris",
	]);
	const social = new Set([
		"social",
		"society",
		"sociology",
		"social studies",
		"sosial",
		"ilmu sosial",
		"ips",
	]);
	const math = new Set([
		"mathematics",
		"math",
		"calculus",
		"algebra",
		"matematika",
		"matematika dasar",
		"aljabar",
	]);
	const computer = new Set([
		"computer",
		"computing",
		"komputer",
		"teknologi informasi",
		"teknologi informasi dan komunikasi",
		"tik",
	]);
	const art = new Set(["art", "arts", "seni budaya", "sbk", "prakarya", "pkwu", "sbdp"]);
	const economy = new Set(["economy", "ekonomi", "ekonomi dan bisnis", "accounting", "akuntansi"]);
	const sport = new Set([
		"sport",
		"sports",
		"olahraga",
		"penjaskes",
		"penjaskesrek",
		"pjok",
		"penjas",
		"pendidikan jasmani",
	]);
	const civic = new Set([
		"civic",
		"civics",
		"pancasila",
		"pkn",
		"pendidikan pancasila dan kewarganegaraan",
		"pendidikan kewarganegaraan",
	]);
	const pharmacy = new Set(["pharmacy", "farmasi", "apotek"]);
	const health = new Set(["health", "kesehatan", "ilmu kesehatan", "kesehatan"]);
	const automotive = new Set(["automotive", "otomotif", "teknik otomotif"]);
	const drama = new Set(["drama", "teater", "acting", "acting class", "theater", "kebudayaan"]);
	const movie = new Set(["movie", "film", "cinema", "film studies", "sinema"]);

	if (bio.has(nameLower)) return Dna;
	if (math.has(nameLower)) return Calculator;
	if (chem.has(nameLower)) return FlaskConical;
	if (physics.has(nameLower)) return Atom;
	if (science.has(nameLower)) return Microscope;
	if (history.has(nameLower)) return BookUser;
	if (social.has(nameLower)) return UsersRound;
	if (computer.has(nameLower)) return Computer;
	if (art.has(nameLower)) return Palette;
	if (economy.has(nameLower)) return CircleDollarSign;
	if (sport.has(nameLower)) return Dumbbell;
	if (civic.has(nameLower)) return Scale;
	if (pharmacy.has(nameLower)) return PillBottle;
	if (health.has(nameLower)) return HeartPulse;
	if (automotive.has(nameLower)) return CarFront;
	if (drama.has(nameLower)) return Drama;
	if (movie.has(nameLower)) return Clapperboard;
	if (languages.has(nameLower)) return Languages;

	return Shapes;
}

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

export function subjectTextColor(subject: string, muted: boolean = false): string {
	const subjectLower = subject.toLowerCase();
	switch (subjectLower) {
		case "laboratory":
			return muted ? "text-informative-muted" : "text-informative";
		case "lesson":
			return muted ? "text-success-muted" : "text-success";
		case "practicum":
			return muted ? "text-interactive-muted" : "text-interactive";
		default:
			return "text-outline";
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
