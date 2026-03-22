import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BlogPostModel } from "@/lib/models/BlogPost";

function requireAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return (
    req.cookies.get("admin_token")?.value === secret ||
    req.headers.get("x-admin-secret") === secret ||
    req.headers.get("authorization") === `Bearer ${secret}`
  );
}

/* ── GET /api/v1/blog ───────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const db = await connectDB();
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured", posts: [], total: 0 },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const category = searchParams.get("category") ?? "";

  const filter: Record<string, unknown> = { published: true };
  if (category) filter.category = category;

  const [posts, total] = await Promise.all([
    BlogPostModel.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BlogPostModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    posts,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

/* ── POST /api/v1/blog ──────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await connectDB();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, content } = body as {
    title?: string;
    slug?: string;
    content?: string;
  };

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "title, slug, and content are required" },
      { status: 400 },
    );
  }

  // Default date to today if not provided
  if (!body.date) {
    body.date = new Date().toISOString().split("T")[0];
  }

  try {
    const post = await BlogPostModel.create(body);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
