import { NextResponse } from "next/server";
import { fetchNewPhones } from "@/lib/api";

/**
 * GET /api/phones
 *
 * Returns new phones (≥ 2025) from the upstream API.
 * Set NEXT_PUBLIC_API_URL in .env.local to enable live data.
 */
export async function GET() {
  const phones = await fetchNewPhones();
  return NextResponse.json(phones);
}
