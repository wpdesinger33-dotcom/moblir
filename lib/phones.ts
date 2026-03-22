import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import { parsePriceNumber, priceRangeLabel, cleanDisplayPrice } from "./price";
import type { DeviceSummary, DeviceDetail, SpecEntry } from "./types";

const PHONES_DIR = path.join(process.cwd(), "phones");

/* ── Re-export types so existing imports still work ───────────────────── */
export type { DeviceSummary as PhoneSummary, DeviceDetail as PhoneData };
export type { DeviceSummary, DeviceDetail };

/* ── Legacy alias used by PhoneCard ──────────────────────────────────── */
export interface PhoneFrontmatter {
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  price: string;
  image: string;
  released: string;
  category: string;
  tags?: string[];
}

/* ── Markdown table parser ────────────────────────────────────────────── */

/* ── Release-date helpers ─────────────────────────────────────────────── */

/**
 * Convert an arbitrary date string from the spec table into "YYYY-MM-DD".
 * Handles formats seen in the MD files:
 *   "03 February 2025", "03-Feb-2025", "01January 2017", "14  February 2024"
 * Returns null when the string cannot be reliably parsed.
 */
function normaliseDateString(raw: string): string | null {
  // Strip "Exp." / "Expected" prefixes and collapse whitespace
  let s = raw.trim()
    .replace(/^(exp\.?\s*|expected\s*)/i, "")
    .replace(/\s+/g, " ")
    .trim();

  // "01January 2017" → "01 January 2017"  (digit immediately followed by letter)
  s = s.replace(/(\d)([A-Za-z])/, "$1 $2");

  // "03-Feb-2025" → "03 Feb 2025"
  s = s.replace(/-/g, " ");

  const d = new Date(s);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
    const mm  = String(d.getMonth() + 1).padStart(2, "0");
    const dd  = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  return null;
}

/**
 * Scan the raw markdown content for a spec-table "Release Date" row and
 * return a sortable "YYYY-MM-DD" string.  Falls back to the frontmatter
 * year string (e.g. "2025") when no precise date is found.
 */
function parsePreciseRelease(content: string, frontmatterYear: string): string {
  const match = content.match(/\|\s*Release Date\s*\|\s*([^|\n]+)\|/i);
  if (match) {
    const precise = normaliseDateString(match[1]);
    if (precise) return precise;
  }
  return frontmatterYear || "N/A";
}

/** Compare two `released` strings (either "YYYY-MM-DD" or plain "YYYY"). */
function releasedMs(released: string): number {
  if (!released || released === "N/A") return 0;
  // Normalise bare year strings (e.g. "2026") to "YYYY-01-01" so the UTC
  // timestamp is always unambiguous regardless of runtime or timezone.
  const s = /^\d{4}$/.test(released) ? `${released}-01-01` : released;
  const d = new Date(s);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}


/**
 * Extract spec rows from a Markdown table embedded in the content body.
 * Handles tables in the form:
 *   | Feature | Details |
 *   |---|---|
 *   | Display | 6.1-inch OLED |
 */
function parseSpecsFromMarkdown(content: string): SpecEntry[] {
  const specs: SpecEntry[] = [];
  const lines = content.split("\n");
  let sawHeader = false;
  let sawSeparator = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      // Reset when we leave a table block
      sawHeader = false;
      sawSeparator = false;
      continue;
    }

    if (!sawHeader) {
      sawHeader = true;
      continue; // skip header row (Feature | Details)
    }

    if (!sawSeparator) {
      // separator row like |---|---|
      if (/^\|[\s|:-]+\|$/.test(trimmed)) {
        sawSeparator = true;
      }
      continue;
    }

    // Data row
    const cells = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter((_, i, a) => i > 0 && i < a.length - 1);
    if (cells.length >= 2 && cells[0] && cells[1]) {
      specs.push({ label: cells[0], value: cells[1] });
    }
  }

  return specs;
}

/* ── Filesystem helpers ───────────────────────────────────────────────── */

export function getAllPhoneParams(): { brandSlug: string; slug: string }[] {
  if (!fs.existsSync(PHONES_DIR)) return [];
  return fs
    .readdirSync(PHONES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const dir = path.join(PHONES_DIR, d.name);
      return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => ({ brandSlug: d.name, slug: f.replace(/\.md$/, "") }));
    });
}

export function getAllPhoneSlugs(): string[] {
  return getAllPhoneParams().map((p) => p.slug);
}

function findPhoneFile(slug: string): { filePath: string; brandSlug: string } | null {
  if (!fs.existsSync(PHONES_DIR)) return null;
  for (const d of fs.readdirSync(PHONES_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const fp = path.join(PHONES_DIR, d.name, `${slug}.md`);
    if (fs.existsSync(fp)) return { filePath: fp, brandSlug: d.name };
  }
  return null;
}

/* ── MD readers ───────────────────────────────────────────────────────── */

export async function getPhoneData(slug: string): Promise<DeviceDetail> {
  const found = findPhoneFile(slug);
  if (!found) throw new Error(`Phone not found: ${slug}`);

  const raw = fs.readFileSync(found.filePath, "utf8");
  const { data, content } = matter(raw);

  const processed = await remark().use(remarkGfm).use(html).process(content);
  let contentHtml = processed.toString();

  const rawPrice = (data.price as string) ?? "";
  const price = cleanDisplayPrice(rawPrice);
  const frontmatterSpecs = (data.specs as SpecEntry[]) ?? [];
  const specs = frontmatterSpecs.length > 0 ? frontmatterSpecs : parseSpecsFromMarkdown(content);

  // When specs were parsed from the markdown table, remove the duplicate table
  // (and its preceding "Specifications" heading) from the rendered HTML so that
  // only the styled specs component is shown on the detail page.
  if (specs.length > 0 && frontmatterSpecs.length === 0) {
    // Remove every <table>…</table> block (specs table already shown via specs[])
    contentHtml = contentHtml.replace(/<table[\s\S]*?<\/table>/gi, "");
    // Remove orphaned "Specifications" headings left behind after table removal
    contentHtml = contentHtml.replace(/<h[1-6][^>]*>\s*Specifications\s*<\/h[1-6]>/gi, "");
    // Trim leading/trailing whitespace and blank paragraphs
    contentHtml = contentHtml.replace(/<p>\s*<\/p>/gi, "").trim();
  }
  return {
    name:        data.name as string,
    slug,
    brand:       data.brand as string,
    brandSlug:   found.brandSlug,
    price,
    priceNum:    parsePriceNumber(rawPrice),
    image:       (data.image as string) ?? "/images/phones/placeholder-phone.svg",
    released:    (data.released as string) ?? "N/A",
    category:    (data.category as string) ?? "phone",
    tags:        (data.tags as string[]) ?? [],
    excerpt:     "",
    priceRange:  priceRangeLabel(rawPrice),
    source:      "md",
    specs,
    description: "",
    contentHtml,
    rawPrice,
  };
}

export function getAllPhoneSummaries(): DeviceSummary[] {
  return getAllPhoneParams()
    .map(({ brandSlug, slug }) => {
      const fp = path.join(PHONES_DIR, brandSlug, `${slug}.md`);
      const raw = fs.readFileSync(fp, "utf8");
      const { data, content } = matter(raw);

      const excerpt =
        content
          .split("\n")
          .find((l) => l.trim().length > 0 && !l.trim().startsWith("#"))
          ?.slice(0, 160) ?? "";

      const rawPrice = (data.price as string) ?? "";
      const price = cleanDisplayPrice(rawPrice);
      const released = parsePreciseRelease(content, (data.released as string) ?? "N/A");
      return {
        name:       data.name as string,
        slug,
        brand:      data.brand as string,
        brandSlug,
        price,
        priceNum:   parsePriceNumber(rawPrice),
        image:      (data.image as string) ?? "/images/phones/placeholder-phone.svg",
        released,
        category:   (data.category as string) ?? "phone",
        tags:       (data.tags as string[]) ?? [],
        excerpt,
        priceRange: priceRangeLabel(rawPrice),
        source:     "md" as const,
        featured:   false,
      };
    })
    .sort((a, b) => {
      // Sort by precise release date descending (newest first)
      const diff = releasedMs(b.released) - releasedMs(a.released);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
}

export function getAllBrands(): string[] {
  if (!fs.existsSync(PHONES_DIR)) return [];
  return fs
    .readdirSync(PHONES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function getPhonesByBrand(brandSlug: string): DeviceSummary[] {
  return getAllPhoneSummaries().filter((p) => p.brandSlug === brandSlug);
}

/* ── Pagination helper ────────────────────────────────────────────────── */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * limit;
  return { items: items.slice(start, start + limit), total, page: safePage, pages, limit };
}
