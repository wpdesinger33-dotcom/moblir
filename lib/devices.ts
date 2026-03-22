/**
 * Server-side helper that merges MongoDB phones (shown first) with local
 * Markdown phones.  Falls back gracefully to MD-only when the DB is not
 * configured or unreachable.
 */

import { connectDB } from "./mongodb";
import { PhoneModel } from "./models/Phone";
import { getAllPhoneSummaries, getAllPhoneSlugs, getPhoneData } from "./phones";
import { priceRangeLabel, cleanDisplayPrice } from "./price";
import type { DeviceSummary, DeviceDetail } from "./types";

/* ── Filters & sort types ─────────────────────────────────────────────── */
export interface DeviceFilters {
  brand?: string;
  q?: string;
  sort?: string;
  range?: string;
  category?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedDevices {
  phones: DeviceSummary[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  apiAvailable: boolean;
}

function applyFilters(phones: DeviceSummary[], f: DeviceFilters): DeviceSummary[] {
  let result = [...phones];

  if (f.brand && f.brand !== "all") {
    result = result.filter((p) => p.brandSlug === f.brand!.toLowerCase());
  }
  if (f.q) {
    const q = f.q.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }
  if (f.range === "budget")   result = result.filter((p) => p.priceNum > 0 && p.priceNum < 30_000);
  if (f.range === "mid")      result = result.filter((p) => p.priceNum >= 30_000 && p.priceNum < 80_000);
  if (f.range === "flagship") result = result.filter((p) => p.priceNum >= 80_000);
  if (f.minPrice !== undefined && f.minPrice > 0)
    result = result.filter((p) => p.priceNum >= f.minPrice!);
  if (f.maxPrice !== undefined && f.maxPrice > 0)
    result = result.filter((p) => p.priceNum <= f.maxPrice!);
  if (f.category && f.category !== "all") {
    result = result.filter((p) => p.category === f.category);
  }

  // Sort
  if (f.sort === "price-asc")  result.sort((a, b) => a.priceNum - b.priceNum);
  else if (f.sort === "price-desc") result.sort((a, b) => b.priceNum - a.priceNum);
  else if (f.sort === "newest") result.sort((a, b) => releasedMs(b.released) - releasedMs(a.released));
  else result.sort((a, b) => {
    // API/featured phones float to top, then newest-first by precise release date
    if (a.source === "api" && b.source !== "api") return -1;
    if (b.source === "api" && a.source !== "api") return 1;
    if (a.featured && !b.featured) return -1;
    if (b.featured && !a.featured) return 1;
    const diff = releasedMs(b.released) - releasedMs(a.released);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });

  return result;
}

/* ── Release-date timestamp helper (shared with phones.ts logic) ─────── */
function releasedMs(released: string): number {
  if (!released || released === "N/A") return 0;
  // Normalise bare year strings (e.g. "2026") to "YYYY-01-01" so the UTC
  // timestamp is always unambiguous regardless of runtime or timezone.
  const s = /^\d{4}$/.test(released) ? `${released}-01-01` : released;
  const d = new Date(s);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}


export async function getMergedPhones(filters: DeviceFilters = {}): Promise<PaginatedDevices> {
  const limit  = Math.min(100, Math.max(1, filters.limit ?? 12));
  const page   = Math.max(1, filters.page ?? 1);

  /* ── MD phones ───────────────────────────────────────────────────────── */
  const mdPhones = getAllPhoneSummaries();
  const mdSlugs  = new Set(mdPhones.map((p) => p.slug)); void mdSlugs; // used as dedup guard below

  /* ── API phones from MongoDB ─────────────────────────────────────────── */
  let apiPhones: DeviceSummary[] = [];
  let apiAvailable = false;

  try {
    const db = await connectDB();
    if (db) {
      apiAvailable = true;
      const raw = await PhoneModel.find({}).sort({ featured: -1, createdAt: -1 }).lean();
      apiPhones = raw.map((p) => ({
        name:       p.name,
        slug:       p.slug,
        brand:      p.brand,
        brandSlug:  p.brandSlug,
        price:      cleanDisplayPrice(p.price),
        priceNum:   p.priceNum,
        image:      p.image ?? "/images/phones/placeholder-phone.svg",
        released:   p.released,
        category:   p.category,
        tags:       p.tags,
        excerpt:    p.description?.slice(0, 160) ?? "",
        priceRange: priceRangeLabel(p.price),
        source:     "api" as const,
        featured:   p.featured,
      }));
    }
  } catch {
    /* DB unavailable – fall through to MD-only */
  }

  // Merge: API phones first, then MD phones not already overridden by API
  const apiSlugs = new Set(apiPhones.map((p) => p.slug));
  const merged   = [
    ...apiPhones,
    ...mdPhones.filter((p) => !apiSlugs.has(p.slug)),
  ];

  // Apply filters + sort
  const filtered = applyFilters(merged, filters);

  // Paginate
  const total  = filtered.length;
  const pages  = Math.max(1, Math.ceil(total / limit));
  const safePg = Math.min(page, pages);
  const slice  = filtered.slice((safePg - 1) * limit, safePg * limit);

  return { phones: slice, total, page: safePg, pages, limit, apiAvailable };
}

/** Return all merged slugs and unique brand slugs (DB + MD) for use in the sitemap. */
export async function getAllMergedSlugsAndBrands(): Promise<{
  slugs: string[];
  brands: string[];
}> {
  const mdPhones = getAllPhoneSummaries();

  let apiPhones: Pick<DeviceSummary, "slug" | "brandSlug">[] = [];
  try {
    const db = await connectDB();
    if (db) {
      const raw = await PhoneModel.find({}).select("slug brandSlug").lean();
      apiPhones = raw.map((p) => ({ slug: p.slug, brandSlug: p.brandSlug }));
    }
  } catch (err) {
    console.error("[Sitemap] DB unavailable, falling back to MD-only:", (err as Error).message);
  }

  const apiSlugs = new Set(apiPhones.map((p) => p.slug));
  const allPhones = [
    ...apiPhones,
    ...mdPhones.filter((p) => !apiSlugs.has(p.slug)),
  ];

  const slugs = allPhones.map((p) => p.slug);
  const brands = [...new Set(allPhones.map((p) => p.brandSlug))].sort();

  return { slugs, brands };
}

/** Get a single phone detail: try DB first, then MD. */
export async function getMergedPhoneDetail(slug: string): Promise<DeviceDetail | null> {
  /* Try MongoDB first */
  try {
    const db = await connectDB();
    if (db) {
      const p = await PhoneModel.findOne({ slug }).lean();
      if (p) {
        return {
          name:        p.name,
          slug:        p.slug,
          brand:       p.brand,
          brandSlug:   p.brandSlug,
          price:       cleanDisplayPrice(p.price),
          priceNum:    p.priceNum,
          image:       p.image ?? "/images/phones/placeholder-phone.svg",
          released:    p.released,
          category:    p.category,
          tags:        p.tags,
          excerpt:     p.description?.slice(0, 160) ?? "",
          priceRange:  priceRangeLabel(p.price),
          source:      "api",
          specs:       p.specs,
          description: p.description,
          featured:    p.featured,
          rawPrice:    p.price,
        };
      }
    }
  } catch { /* fall through */ }

  /* Fall back to MD */
  if (getAllPhoneSlugs().includes(slug)) {
    return getPhoneData(slug);
  }

  return null;
}
