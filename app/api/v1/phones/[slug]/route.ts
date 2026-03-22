import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PhoneModel } from "@/lib/models/Phone";
import { parsePriceNumber } from "@/lib/price";
import { verifyAdminToken } from "@/lib/adminToken";

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  const token  = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret) return false;
  if (header === secret) return true;

  if (token) {
    const payload = await verifyAdminToken(token);
    if (payload) return true;
    if (token === secret) return true; // legacy fallback
  }

  return false;
}

/* ── GET /api/v1/phones/[slug] ─────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = await connectDB();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const phone = await PhoneModel.findOne({ slug }).lean();
  if (!phone) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ phone });
}

/* ── PUT /api/v1/phones/[slug] ─────────────────────────────────────────── */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const db = await connectDB();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.price) body.priceNum = parsePriceNumber(body.price as string);
  if (body.brand) body.brandSlug = (body.brand as string).toLowerCase().replace(/[^a-z0-9]/g, "");

  const phone = await PhoneModel.findOneAndUpdate(
    { slug },
    { $set: body },
    { new: true, runValidators: true }
  ).lean();

  if (!phone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ phone });
}

/* ── DELETE /api/v1/phones/[slug] ──────────────────────────────────────── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const db = await connectDB();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const result = await PhoneModel.deleteOne({ slug });
  if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
