import * as schema from "$lib/schema/db";
import { grades, user, userRole } from "$lib/schema/db";
import { createClient } from "@libsql/client";
import bcryptjs from "bcryptjs";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";

function findDatabasePath() {
	const baseDir = path.resolve(process.cwd(), ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

	if (!fs.existsSync(baseDir)) {
		throw new Error(`Database directory not found: ${baseDir}`);
	}

	const files = fs.readdirSync(baseDir);
	const sqliteFile = files.find((file) => file.endsWith(".sqlite"));

	if (!sqliteFile) {
		throw new Error(
			"No SQLite database file found. Make sure to run migrations first.(`pnpm wrangler d1 migrations apply prod-db --local`)",
		);
	}

	return path.join(baseDir, sqliteFile);
}

export async function seedDatabase() {
	const dbPath = findDatabasePath();
	console.log(`📁 Using database: ${path.basename(dbPath)}`);

	const client = createClient({
		url: `file:${dbPath}`,
	});
	const db = drizzle(client, { schema });

	try {
		console.log("🌱 Starting database seed...");

		// Check if data already exists
		const existingRoles = await db.select({ count: count() }).from(userRole);
		const roleCount = existingRoles[0]?.count ?? 0;

		if (roleCount > 0) {
			console.log("⚠️  Database already seeded. Skipping...");
			console.log("📝 If you want to re-seed, delete the database file first.");
			return;
		}

		// 1. Seed User Roles
		await db.insert(userRole).values([
			{ id: 1, name: "Super Admin" },
			{ id: 2, name: "Admin" },
			{ id: 3, name: "Teacher" },
			{ id: 4, name: "Student" },
		]);
		console.log("✅ User roles seeded");

		// 2. Seed Grades
		await db.insert(grades).values([
			{ id: 1, level: 10 },
			{ id: 2, level: 11 },
			{ id: 3, level: 12 },
		]);
		console.log("✅ Grades seeded");

		// 3. Seed Default Users
		const defaultPassword = await bcryptjs.hash("password123", 10);

		await db.insert(user).values([
			{
				id: 1,
				fullname: "Super Administrator",
				username: "superadmin",
				password: defaultPassword,
				dob: "1990-01-01",
				roleId: 1,
				schoolId: null,
				gradesId: null,
			},
		]);
		console.log("✅ Default users seeded");

		// 4. Seed Subject Types
		await db.insert(schema.subjectType).values([
			{ id: 1, name: "Laboratory" },
			{ id: 2, name: "Lesson" },
			{ id: 3, name: "Practicum" },
		]);
		console.log("✅ Subject types seeded");
		console.log("🎉 Database seeding completed successfully!");
		console.log("📝 Default login credentials:");
		console.log("   Super Admin: superadmin / password123");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		throw error;
	}
}
