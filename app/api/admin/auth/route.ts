/**
 * Admin authentication – 2-step login
 *
 * Step 1: POST { email, secret }
 *   → validates credentials (DB-first, env fallback)
 *   → on success: sets `admin_step1` httpOnly cookie (holds email) and
 *     returns { step: "security_question" }
 *
 * Step 2: POST { securityAnswer }
 *   → requires admin_step1 cookie to be present
 *   → validates the security-question answer (DB-first, env fallback)
 *   → on success: clears admin_step1, sets signed `admin_token` httpOnly cookie
 *
 * DELETE: logout (clears both cookies)
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { AdminUserModel } from "@/lib/models/AdminUser";
import { createAdminToken } from "@/lib/adminToken";

const STEP1_COOKIE  = "admin_step1";
const TOKEN_COOKIE  = "admin_token";
const COOKIE_OPTS   = { httpOnly: true, sameSite: "lax" as const, path: "/" };
const STEP1_MAX_AGE = 60 * 10;          // 10 minutes to complete step 2
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7-day session

export async function POST(req: NextRequest) {
  let body: { email?: string; secret?: string; securityAnswer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  /* ── Step 2: security-question verification ──────────────────────────── */
  if (body.securityAnswer !== undefined) {
    const step1Cookie = req.cookies.get(STEP1_COOKIE)?.value;
    if (!step1Cookie) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    const answer = body.securityAnswer.trim().toLowerCase();
    let valid = false;

    const db = await connectDB();
    if (db) {
      const adminUser = await AdminUserModel.findOne({ email: step1Cookie });
      if (adminUser) {
        valid = await bcrypt.compare(answer, adminUser.securityAnswerHash);
      }
    }

    // Env fallback – ADMIN_SECURITY_ANSWER or default "jamilakhatun"
    if (!valid) {
      const envAnswer = (process.env.ADMIN_SECURITY_ANSWER ?? "jamilakhatun").toLowerCase();
      valid = answer === envAnswer;
    }

    if (!valid) {
      return NextResponse.json({ error: "Incorrect answer" }, { status: 401 });
    }

    // Issue a signed session token
    const sessionToken = await createAdminToken(step1Cookie, TOKEN_MAX_AGE);

    const res = NextResponse.json({ success: true });
    res.cookies.delete(STEP1_COOKIE);
    res.cookies.set(TOKEN_COOKIE, sessionToken, { ...COOKIE_OPTS, maxAge: TOKEN_MAX_AGE });
    return res;
  }

  /* ── Step 1: email + password verification ───────────────────────────── */
  const email  = (body.email  ?? "").trim().toLowerCase();
  const secret = (body.secret ?? "").trim();

  if (!email || !secret) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let credentialsValid = false;

  const db = await connectDB();
  if (db) {
    const adminUser = await AdminUserModel.findOne({ email });
    if (adminUser) {
      credentialsValid = await bcrypt.compare(secret, adminUser.passwordHash);
    }
  }

  // Env fallback (works even without MongoDB)
  if (!credentialsValid) {
    const adminEmail  = (process.env.ADMIN_EMAIL  ?? "").toLowerCase();
    const adminSecret =  process.env.ADMIN_SECRET ?? "";
    if (!adminSecret) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }
    credentialsValid = email === adminEmail && secret === adminSecret;
  }

  if (!credentialsValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Step 1 passed → ask for security question
  const res = NextResponse.json({ step: "security_question" });
  res.cookies.set(STEP1_COOKIE, email, { ...COOKIE_OPTS, maxAge: STEP1_MAX_AGE });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(STEP1_COOKIE);
  return res;
}
