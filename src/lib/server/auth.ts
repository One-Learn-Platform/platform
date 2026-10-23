import type { RequestEvent } from "@sveltejs/kit";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { sveltekitCookies } from "better-auth/svelte-kit";
import bcryptjs from "bcryptjs";
import { env } from "$env/dynamic/private";
import { getRequestEvent } from "$app/server";
import { getDb } from "$lib/server/db";
import { validateUsername } from "$lib/server/auth-function";
import * as table from "$lib/schema/db";

const DAY_IN_SECONDS = 60 * 60 * 24;
const SUPER_ADMIN_ROLE_ID = 1;

// Super admins are better-auth admins; every other app role is a plain user.
export function authRoleFor(roleId: number) {
	return roleId === SUPER_ADMIN_ROLE_ID ? "admin" : "user";
}

// Existing passwords are bcrypt (cost 10); better-auth reuses them as-is.
export function hashPassword(password: string) {
	return bcryptjs.hash(password, 10);
}

// Users sign in by username, but better-auth requires a unique email.
export function placeholderEmail() {
	return `user-${crypto.randomUUID()}@lms.invalid`;
}

function createAuth(event: RequestEvent) {
	return betterAuth({
		baseURL: event.url.origin,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(getDb(event), {
			provider: "sqlite",
			schema: {
				user: table.user,
				session: table.session,
				account: table.account,
				verification: table.verification,
				rateLimit: table.rateLimit,
			},
		}),
		advanced: {
			database: { generateId: "serial" },
			ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },
		},
		// Only applies to requests that go through `auth.handler`, not direct `auth.api` calls.
		rateLimit: {
			enabled: true,
			// Workers isolates don't share memory, so keep counters in D1.
			storage: "database",
			customRules: {
				"/sign-in/username": { window: 60, max: 5 },
			},
		},
		user: {
			fields: {
				name: "fullname",
				image: "avatar",
				createdAt: "authCreatedAt",
				updatedAt: "authUpdatedAt",
			},
			additionalFields: {
				roleId: { type: "number", required: true, input: false },
				schoolId: { type: "number", required: false, input: false },
				gradesId: { type: "number", required: false, input: false },
				dob: { type: "string", required: true, input: false },
			},
		},
		emailAndPassword: {
			enabled: true,
			// Accounts are created by admins only.
			disableSignUp: true,
			minPasswordLength: 6,
			maxPasswordLength: 255,
			password: {
				hash: hashPassword,
				verify: ({ hash, password }) => bcryptjs.compare(password, hash),
			},
		},
		session: {
			expiresIn: DAY_IN_SECONDS * 30,
			updateAge: DAY_IN_SECONDS * 15,
		},
		plugins: [
			username({
				usernameNormalization: false,
				usernameValidator: validateUsername,
				minUsernameLength: 3,
				maxUsernameLength: 30,
			}),
			admin({
				defaultRole: "user",
				adminRoles: ["admin"],
				// `role` on locals.user is the app's numeric role; keep better-auth's apart.
				schema: { user: { fields: { role: "authRole" } } },
			}),
			// Must stay last so cookies set by auth.api calls reach SvelteKit.
			sveltekitCookies(getRequestEvent),
		],
	});
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthUser = Auth["$Infer"]["Session"]["user"];

const authCache = new WeakMap<RequestEvent, Auth>();

// D1 is bound per request, so the auth instance is too.
export function getAuth(event: RequestEvent): Auth {
	let auth = authCache.get(event);
	if (!auth) {
		auth = createAuth(event);
		authCache.set(event, auth);
	}
	return auth;
}

type SignInResult =
	{ ok: true; user: AuthUser } | { ok: false; reason: "rate-limited" | "invalid-credentials" };

// Runs through `auth.handler` (not `auth.api`) so better-auth's rate limiter applies.
// No public /api/auth route is mounted; the request never leaves this worker.
export async function signInUsername(
	event: RequestEvent,
	body: { username: string; password: string },
): Promise<SignInResult> {
	const auth = getAuth(event);
	const headers = new Headers(event.request.headers);
	headers.set("content-type", "application/json");
	headers.delete("content-length");
	const response = await auth.handler(
		new Request(new URL("/api/auth/sign-in/username", event.url.origin), {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		}),
	);

	if (response.status === 429) {
		return { ok: false, reason: "rate-limited" };
	}
	if (!response.ok) {
		return { ok: false, reason: "invalid-credentials" };
	}

	// sveltekitCookies skips router calls, so copy the session cookie over here.
	for (const [name, attributes] of parseSetCookieHeader(response.headers.get("set-cookie") ?? "")) {
		event.cookies.set(name, attributes.value, {
			...toCookieOptions(attributes),
			path: attributes.path || "/",
		});
	}
	const { user } = (await response.json()) as { user: AuthUser };
	return { ok: true, user };
}

type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

// Keeps the `locals.user` / `locals.session` shape the rest of the app relies on.
export function toLocals(result: AuthSession | null) {
	if (!result) {
		return { user: null, session: null };
	}
	const { user, session } = result;
	return {
		user: {
			id: Number(user.id),
			avatar: user.image ?? null,
			username: user.username as string,
			fullname: user.name,
			role: user.roleId,
			school: user.schoolId ?? null,
		},
		session: {
			id: session.id,
			userId: Number(session.userId),
			expiresAt: session.expiresAt,
		},
	};
}

export type SessionValidationResult = ReturnType<typeof toLocals>;
