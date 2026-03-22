import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PhoneModel } from "@/lib/models/Phone";
import { parsePriceNumber } from "@/lib/price";
import { verifyAdminToken } from "@/lib/adminToken";

const PAGE_LIMIT = 12;

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  const token  = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret) return false;

  // CLI / header-based access (plain secret)
  if (header === secret) return true;

  // Cookie: try new HMAC-signed token first, then legacy equality
  if (token) {
    const payload = await verifyAdminToken(token);
    if (payload) return true;
    if (token === secret) return true; // legacy fallback
  }

  return false;
}

/* ── GET /api/v1/phones ─────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const db = await connectDB();
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured", phones: [], total: 0, page: 1, pages: 0 },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? String(PAGE_LIMIT), 10)));
  const brand    = searchParams.get("brand") ?? "";
  const q        = searchParams.get("q") ?? "";
  const sort     = searchParams.get("sort") ?? "featured";
  const range    = searchParams.get("range") ?? "";
  const category = searchParams.get("category") ?? "phone";

  // Build typed Mongoose filter
  const filter: Record<string, unknown> = { category };
  if (brand) filter.brandSlug = brand.toLowerCase();
  if (range === "budget")   filter.priceNum = { $lt: 30_000 };
  if (range === "mid")      filter.priceNum = { $gte: 30_000, $lt: 80_000 };
  if (range === "flagship") filter.priceNum = { $gte: 80_000 };
  if (q) filter.$text = { $search: q };

  // Typed sort
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    featured:     { featured: -1, createdAt: -1 },
    "price-asc":  { priceNum: 1 },
    "price-desc": { priceNum: -1 },
    newest:       { released: -1, createdAt: -1 },
    name:         { name: 1 },
  };
  const mongoSort = sortMap[sort] ?? sortMap["featured"];

  const [phones, total] = await Promise.all([
    PhoneModel.find(filter).sort(mongoSort).skip((page - 1) * limit).limit(limit).lean(),
    PhoneModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    phones,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  });
}

/* ── POST /api/v1/phones ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) {
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

  const { name, slug, brand, price } = body as {
    name?: string; slug?: string; brand?: string; price?: string;
  };
  if (!name || !slug || !brand || !price) {
    return NextResponse.json({ error: "name, slug, brand, price are required" }, { status: 400 });
  }

  const brandSlug = (brand as string).toLowerCase().replace(/[^a-z0-9]/g, "");
  const priceNum  = parsePriceNumber(price as string);

  try {
    const phone = await PhoneModel.create({
      ...body,
      brandSlug,
      priceNum,
      source: "api",
    });
    return NextResponse.json({ phone }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
