export function validateUsername(username: unknown): username is string {
	// Alphanumeric, hyphen, underscore
	return (
		typeof username === "string" &&
		username.length >= 3 &&
		username.length <= 30 &&
		/^[a-z0-9_.-]+$/i.test(username)
	);
}

export function validatePassword(password: unknown): password is string {
	return (
		typeof password === "string" && password.length >= 6 && password.length <= 255
		// && /^(?=.*[a-zA-Z])(?=.*\d).*$/.test(password)
	);
}
