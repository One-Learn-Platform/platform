import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { getDb } from "$lib/server/db";
import * as table from "$lib/schema/db";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(event: RequestEvent, token: string, userId: string) {
	const db = getDb(event);
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(event: RequestEvent, token: string) {
	const db = getDb(event);
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: {
				id: table.user.id,
				avatar: table.user.avatar,
				username: table.user.username,
				fullname: table.user.fullname,
				role: table.user.roleId,
				school: table.user.schoolId,
			},
			session: table.session,
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(event: RequestEvent, sessionId: string) {
	const db = getDb(event);
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: "/",
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
	});
}

interface ThrottlingCounter {
	index: number;
	updatedAt: number;
}

export class Throttler {
	public timeoutSeconds: number[];

	private readonly storage = new Map<string, ThrottlingCounter>();

	constructor(timeoutSeconds: number[]) {
		this.timeoutSeconds = timeoutSeconds;
	}

	public consume(ipAddress: string): boolean {
		let counter = this.storage.get(ipAddress) ?? null;
		const now = Date.now();
		if (counter === null) {
			counter = {
				index: 0,
				updatedAt: now,
			};
			this.storage.set(ipAddress, counter);
			return true;
		}
		const allowed = now - counter.updatedAt >= this.timeoutSeconds[counter.index] * 1000;
		if (!allowed) {
			return false;
		}
		counter.updatedAt = now;
		counter.index = Math.min(counter.index + 1, this.timeoutSeconds.length - 1);
		this.storage.set(ipAddress, counter);
		return true;
	}

	public reset(ipAddress: string): void {
		this.storage.delete(ipAddress);
	}
}
