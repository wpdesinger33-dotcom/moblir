/**
 * Shared types that are used by both the MD layer and the MongoDB API layer.
 */

export interface SpecEntry {
  label: string;
  value: string;
}

/** A phone summary card – used in listing pages */
export interface DeviceSummary {
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  price: string;
  priceNum: number;
  image: string;
  released: string;
  category: string;
  tags: string[];
  excerpt: string;
  priceRange: "Budget" | "Mid-range" | "Flagship";
  /** "api" = from MongoDB (shown first); "md" = from Markdown */
  source: "api" | "md";
  featured?: boolean;
}

/** Full phone detail */
export interface DeviceDetail extends DeviceSummary {
  specs: SpecEntry[];
  description: string;
  /** Rendered HTML (MD phones only) */
  contentHtml?: string;
  /** Raw price string from frontmatter, for variant parsing */
  rawPrice?: string;
}
