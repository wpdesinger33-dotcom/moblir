/**
 * seedAdmin
 *
 * Automatically seeds the AdminUser document in MongoDB from environment
 * variables when the server starts, if no admin user exists yet.
 *
 * Called from instrumentation.ts (Next.js server startup hook).
 */
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { AdminUserModel } from "@/lib/models/AdminUser";

const SALT_ROUNDS = 12;

export async function seedAdmin(): Promise<void> {
  const email          = (process.env.ADMIN_EMAIL           ?? "").trim().toLowerCase();
  const password       =  process.env.ADMIN_SECRET          ?? "";
  // Match the auth-route env fallback: default to "jamilakhatun" when unset.
  const securityAnswer = (process.env.ADMIN_SECURITY_ANSWER ?? "jamilakhatun").trim().toLowerCase();

  if (!email || !password) {
    // Not configured – skip silently so the app still starts without env vars.
    return;
  }

  const db = await connectDB();
  if (!db) {
    // MongoDB not configured – nothing to seed.
    return;
  }

  const existing = await AdminUserModel.findOne({ email });
  if (existing) {
    // Admin already in DB – nothing to do.
    return;
  }

  const passwordHash       = await bcrypt.hash(password,       SALT_ROUNDS);
  const securityAnswerHash = await bcrypt.hash(securityAnswer, SALT_ROUNDS);

  await AdminUserModel.create({ email, passwordHash, securityAnswerHash });
  console.log("[Admin] Admin user seeded to database from environment variables.");
}
