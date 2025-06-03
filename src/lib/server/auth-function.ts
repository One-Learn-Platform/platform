import { encodeBase32LowerCase } from "@oslojs/encoding";

export function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

export function validateFullname(fullname: unknown): fullname is string {
	// Alphanumeric, hyphen, underscore, space
	return typeof fullname === "string" && fullname.length >= 2 && /^[a-z0-9_-\s]+$/i.test(fullname);
}

export function validateUsername(username: unknown): username is string {
	// Alphanumeric, hyphen, underscore
	return (
		typeof username === "string" &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_.-]+$/i.test(username)
	);
}

export function validatePassword(password: unknown): password is string {
	return (
		typeof password === "string" && password.length >= 6 && password.length <= 255
		// && /^(?=.*[a-zA-Z])(?=.*\d).*$/.test(password)
	);
}
