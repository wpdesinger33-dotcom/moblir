/**
 * Configuration for dynamic budget / price-range SEO pages.
 *
 * Each entry becomes:
 *   /phones/budget/<slug>            – e.g. /phones/budget/under-3000
 *   /phones/budget/<brand>-<slug>    – e.g. /phones/budget/realme-under-10000
 */

export interface BudgetPageConfig {
  /** URL slug, e.g. "under-3000" */
  slug: string;
  /** Human label, e.g. "Under ৳ 3,000" */
  label: string;
  /** Max price (exclusive) in BDT */
  maxPrice: number;
  /** Optional min price (inclusive) in BDT */
  minPrice?: number;
}

/** Price tiers that generate standalone pages. */
export const BUDGET_TIERS: BudgetPageConfig[] = [
  { slug: "under-3000",  label: "Under ৳ 3,000",        maxPrice: 3_000 },
  { slug: "under-5000",  label: "Under ৳ 5,000",        maxPrice: 5_000 },
  { slug: "under-10000", label: "Under ৳ 10,000",       maxPrice: 10_000 },
  { slug: "under-15000", label: "Under ৳ 15,000",       maxPrice: 15_000 },
  { slug: "under-20000", label: "Under ৳ 20,000",       maxPrice: 20_000 },
  { slug: "under-30000", label: "Under ৳ 30,000",       maxPrice: 30_000 },
  { slug: "under-50000", label: "Under ৳ 50,000",       maxPrice: 50_000 },
  { slug: "30000-to-50000", label: "৳ 30,000 – ৳ 50,000", maxPrice: 50_000, minPrice: 30_000 },
  { slug: "50000-to-80000", label: "৳ 50,000 – ৳ 80,000", maxPrice: 80_000, minPrice: 50_000 },
];

/** Popular brands that generate brand-specific budget pages. */
export const BUDGET_BRANDS = [
  "samsung", "apple", "xiaomi", "oppo", "vivo", "realme", "oneplus",
  "nokia", "infinix", "tecno", "itel", "poco", "redmi", "honor",
];

/** Parse a budget slug (possibly with brand prefix) into config + optional brand. */
export function parseBudgetSlug(
  raw: string
): { config: BudgetPageConfig; brand: string | null } | null {
  // Try brand-prefixed slug: "realme-under-10000"
  for (const brand of BUDGET_BRANDS) {
    if (raw.startsWith(`${brand}-`)) {
      const tierSlug = raw.slice(brand.length + 1);
      const config = BUDGET_TIERS.find((t) => t.slug === tierSlug);
      if (config) return { config, brand };
    }
  }

  // Try plain slug: "under-10000"
  const config = BUDGET_TIERS.find((t) => t.slug === raw);
  if (config) return { config, brand: null };

  return null;
}

/** Generate all valid budget slugs for static params / sitemap. */
export function getAllBudgetSlugs(): string[] {
  const slugs: string[] = [];

  // Plain tiers
  for (const tier of BUDGET_TIERS) {
    slugs.push(tier.slug);
  }

  // Brand-specific tiers (only "under" tiers, not ranges)
  for (const brand of BUDGET_BRANDS) {
    for (const tier of BUDGET_TIERS) {
      if (!tier.minPrice) {
        slugs.push(`${brand}-${tier.slug}`);
      }
    }
  }

  return slugs;
}
