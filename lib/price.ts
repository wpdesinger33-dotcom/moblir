/**
 * Price utilities for Bangladeshi Taka (BDT / ৳) prices.
 */

/** A single variant option with its name and price */
export interface PriceVariant {
  name: string;
  price: string;
  priceNum: number;
}

/** Structured price breakdown parsed from raw price strings */
export interface PriceBreakdown {
  /** Primary clean display price, e.g. "৳ 2,19,999" */
  displayPrice: string;
  /** "Official" | "Unofficial" | null */
  priceLabel: string | null;
  /** Unofficial price (if different from official) */
  unofficialPrice: string | null;
  /** Variant options with individual prices */
  variants: PriceVariant[];
  /** Original price before discount (strikethrough) */
  originalPrice: string | null;
  /** Discount text, e.g. "You Save: ৳24,000 (9.84% off)" */
  discount: string | null;
}

/**
 * Parse a raw price string into a structured breakdown.
 *
 * Example inputs:
 *   "৳243,999৳.219,999(Official)You Save:৳24,000(9.84% off)৳.105,000(Unofficial)
 *    256GB Dual...Variant:256GB Dual৳.219,999 512GB Dual৳.113,500 ..."
 *   "৳.110,000(Unofficial)12GB+256GB...Variant:12GB+256GB GB৳.110,000..."
 *   "৳ 99,999"  (already clean)
 */
export function parsePriceBreakdown(raw: string): PriceBreakdown {
  const result: PriceBreakdown = {
    displayPrice: "Price unavailable",
    priceLabel: null,
    unofficialPrice: null,
    variants: [],
    originalPrice: null,
    discount: null,
  };

  if (!raw) return result;

  // Extract official price: ৳.219,999(Official) or ৳ 219,999(Official)
  const officialMatch = raw.match(/৳[.\s]*([\d,]+)\s*\(Official\)/);
  // Extract unofficial price: ৳.105,000(Unofficial)
  const unofficialMatch = raw.match(/৳[.\s]*([\d,]+)\s*\(Unofficial\)/);

  if (officialMatch) {
    const num = officialMatch[1].replace(/,/g, "");
    result.displayPrice = formatBDT(parseInt(num, 10));
    result.priceLabel = "Official";
  } else if (unofficialMatch) {
    const num = unofficialMatch[1].replace(/,/g, "");
    result.displayPrice = formatBDT(parseInt(num, 10));
    result.priceLabel = "Unofficial";
  } else {
    // Fallback: first ৳ + number
    const simpleMatch = raw.match(/৳[.\s]*([\d,]+)/);
    if (simpleMatch) {
      const num = simpleMatch[1].replace(/,/g, "");
      result.displayPrice = formatBDT(parseInt(num, 10));
    }
  }

  // If we found official but there's also an unofficial
  if (officialMatch && unofficialMatch) {
    const num = unofficialMatch[1].replace(/,/g, "");
    result.unofficialPrice = formatBDT(parseInt(num, 10));
  }

  // Check for original (strikethrough) price - the first price before official
  if (officialMatch) {
    const beforeOfficial = raw.substring(0, officialMatch.index);
    const origMatch = beforeOfficial.match(/৳[.\s]*([\d,]+)/);
    if (origMatch) {
      const origNum = parseInt(origMatch[1].replace(/,/g, ""), 10);
      const officialNum = parseInt(officialMatch[1].replace(/,/g, ""), 10);
      if (origNum > officialNum) {
        result.originalPrice = formatBDT(origNum);
      }
    }
  }

  // Extract discount info
  const discountMatch = raw.match(/You Save:\s*৳[.\s]*([\d,]+)\s*\(([^)]+)\)/);
  if (discountMatch) {
    result.discount = `Save ৳ ${discountMatch[1]} (${discountMatch[2]})`;
  }

  // Extract variants from "Variant:..." section
  const variantSection = raw.match(/Variant:([\s\S]*?)(?:Updated on:|$)/);
  if (variantSection) {
    const variantText = variantSection[1];
    // Split on ৳ to get pairs of [variantName, price+nextName...]
    // e.g. "256GB Dual৳.219,999512GB Dual৳.113,5001TB Dual৳.135,000"
    // splits into: ["256GB Dual", ".219,999512GB Dual", ".113,5001TB Dual", ".135,000"]
    const parts = variantText.split("৳");
    const seen = new Set<string>();

    for (let i = 0; i < parts.length - 1; i++) {
      const pricePart = parts[i + 1];

      // Extract leading price – BDT format: optional dot/space, then digits with commas
      const priceMatch = pricePart.match(/^[.\s]*((?:\d{1,3},)*\d{1,3})/);
      if (!priceMatch) continue;

      const priceNum = parseInt(priceMatch[1].replace(/,/g, ""), 10);
      if (priceNum <= 0) continue;

      // For variant name, we need to look at what comes BEFORE this ৳ symbol.
      // For i=0, the name is all of parts[0].
      // For i>0, the name is what comes AFTER the price in parts[i].
      let name: string;
      if (i === 0) {
        name = parts[0].trim();
      } else {
        // parts[i] is like ".219,999512GB Dual" — strip the leading price to get "512GB Dual"
        const prevPriceMatch = parts[i].match(/^[.\s]*(?:\d{1,3},)*\d{1,3}/);
        name = prevPriceMatch
          ? parts[i].slice(prevPriceMatch[0].length).trim()
          : parts[i].trim();
      }

      // Clean up the name — only strip leading punctuation/spaces, NOT digits
      // (variant names often start with digits like "256GB", "3GB+64GB")
      name = name.replace(/^[.,\s]+/, "").trim();

      const key = `${name}-${priceNum}`;
      if (name && !seen.has(key)) {
        seen.add(key);
        result.variants.push({
          name,
          price: formatBDT(priceNum),
          priceNum,
        });
      }
    }
  }

  return result;
}

/**
 * Clean a raw price string that may contain variant info, discounts,
 * official/unofficial labels, and timestamps.  Returns only the primary
 * display price, e.g. "৳ 99,999 (Official)".
 *
 * Example inputs:
 *   "৳243,999৳.219,999(Official)You Save:…Variant:…Updated on:…"
 *   "৳.110,000(Unofficial)12GB+256GB…Updated on:…"
 *   "৳ 99,999"  (already clean)
 */
export function cleanDisplayPrice(raw: string): string {
  if (!raw) return "Price unavailable";

  // Try to find the first price tagged (Official) or (Unofficial)
  const taggedMatch = raw.match(/৳[.\s]*([\d,]+)\s*\((Official|Unofficial)\)/);
  if (taggedMatch) {
    const label = taggedMatch[2]; // "Official" or "Unofficial"
    // Format the number with proper Bangladeshi comma grouping
    const num = taggedMatch[1].replace(/,/g, "");
    const formatted = formatBDT(parseInt(num, 10));
    return `${formatted} (${label})`;
  }

  // Fallback: extract the first ৳ + number occurrence
  const simpleMatch = raw.match(/৳[.\s]*([\d,]+)/);
  if (simpleMatch) {
    const num = simpleMatch[1].replace(/,/g, "");
    return formatBDT(parseInt(num, 10));
  }

  return raw;
}

/** Format a number as BDT with Bangladeshi comma grouping: ৳ 1,59,999 */
export function formatBDT(n: number): string {
  if (isNaN(n) || n <= 0) return "Price unavailable";
  // Bangladeshi grouping: last 3 digits, then groups of 2
  const s = n.toString();
  if (s.length <= 3) return `৳ ${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `৳ ${grouped},${last3}`;
}

/**
 * Parse a BDT price string like "৳ 1,59,999" into a number (159999).
 * For raw strings with variants/tags, extracts the first tagged price.
 * Returns -1 when unparseable.
 */
export function parsePriceNumber(price: string): number {
  // First try to find a tagged (Official) or (Unofficial) price
  const taggedMatch = price.match(/৳[.\s]*([\d,]+)\s*\((Official|Unofficial)\)/);
  if (taggedMatch) {
    const n = parseInt(taggedMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(n)) return n;
  }
  // Fallback: first number sequence
  const cleaned = price.replace(/[^\d]/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? -1 : n;
}

/** Human-readable price range label based on BDT value. */
export function priceRangeLabel(price: string): "Budget" | "Mid-range" | "Flagship" {
  const n = parsePriceNumber(price);
  if (n < 0)       return "Flagship";
  if (n < 30_000)  return "Budget";
  if (n < 80_000)  return "Mid-range";
  return "Flagship";
}

/** Tailwind colour classes for the price-range badge. */
export function priceRangeClass(label: "Budget" | "Mid-range" | "Flagship"): string {
  switch (label) {
    case "Budget":    return "bg-green-100 text-green-700";
    case "Mid-range": return "bg-yellow-100 text-yellow-700";
    case "Flagship":  return "bg-purple-100 text-purple-700";
  }
}
