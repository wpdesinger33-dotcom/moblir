/**
 * POST /api/admin/setup
 *
 * One-time endpoint to seed the AdminUser document in MongoDB.
 * Protected by the ADMIN_SETUP_KEY env var (or falls back to ADMIN_SECRET).
 * Once an admin user exists this endpoint becomes a no-op (returns 409).
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { AdminUserModel } from "@/lib/models/AdminUser";

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const setupKey = process.env.ADMIN_SETUP_KEY ?? process.env.ADMIN_SECRET;
  if (!setupKey) {
    return NextResponse.json({ error: "Setup not configured" }, { status: 503 });
  }

  let body: { setupKey?: string; email?: string; password?: string; securityAnswer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.setupKey !== setupKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email          = (body.email          ?? process.env.ADMIN_EMAIL  ?? "").trim().toLowerCase();
  const password       = (body.password       ?? process.env.ADMIN_SECRET ?? "").trim();
  const securityAnswer = (body.securityAnswer ?? "jamilakhatun").trim().toLowerCase();

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const db = await connectDB();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const existing = await AdminUserModel.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Admin user already exists" }, { status: 409 });
  }

  const passwordHash       = await bcrypt.hash(password,       SALT_ROUNDS);
  const securityAnswerHash = await bcrypt.hash(securityAnswer, SALT_ROUNDS);

  await AdminUserModel.create({ email, passwordHash, securityAnswerHash });

  return NextResponse.json({ success: true, message: "Admin user created" }, { status: 201 });
}
