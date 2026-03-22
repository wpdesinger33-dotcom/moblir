import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getMergedPhones } from "@/lib/devices";
import PhoneCard from "@/components/PhoneCard";
import {
  parseBudgetSlug,
  getAllBudgetSlugs,
  BUDGET_TIERS,
} from "@/lib/budget-pages";
import { buildBreadcrumbJsonLd } from "@/lib/seo-helpers";

const SITE = "https://gadgetpricebd.vercel.app";

interface PageProps {
  params: Promise<{ budget: string }>;
}

// ── Static generation ─────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllBudgetSlugs().map((budget) => ({ budget }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { budget } = await params;
  const parsed = parseBudgetSlug(budget);
  if (!parsed) return { title: "Not Found" };

  const { config, brand } = parsed;
  const brandLabel = brand ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} ` : "";
  const title = `${brandLabel}Phones ${config.label} in Bangladesh`;
  const description = `Browse ${brandLabel.toLowerCase()}mobile phones ${config.label.toLowerCase()} with full specifications and prices in Bangladesh. Find the best budget smartphones.`;

  return {
    title,
    description,
    keywords: [
      `phones ${config.label.toLowerCase()}`,
      brand ? `${brand} phones ${config.label.toLowerCase()}` : "",
      "mobile price bangladesh",
      "budget phones bangladesh",
      "cheap phones bd",
    ].filter(Boolean),
    openGraph: {
      title: `${title} | GadgetPriceBD`,
      description,
    },
    alternates: {
      canonical: `${SITE}/phones/budget/${budget}`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BudgetPage({ params }: PageProps) {
  const { budget } = await params;
  const parsed = parseBudgetSlug(budget);
  if (!parsed) notFound();

  const { config, brand } = parsed;
  const brandLabel = brand
    ? brand.charAt(0).toUpperCase() + brand.slice(1)
    : null;

  // Fetch all phones, filter by price range (and brand if specified)
  const { phones: allPhones } = await getMergedPhones({
    brand:    brand ?? undefined,
    category: "phone",
    limit:    500,
  });

  const filtered = allPhones.filter((p) => {
    if (p.priceNum <= 0) return false;
    if (p.priceNum >= config.maxPrice) return false;
    if (config.minPrice && p.priceNum < config.minPrice) return false;
    return true;
  });

  // Sort by price ascending
  filtered.sort((a, b) => a.priceNum - b.priceNum);

  // Related tiers for cross-linking
  const relatedTiers = BUDGET_TIERS.filter((t) => t.slug !== config.slug);

  // Breadcrumb JSON-LD
  const breadcrumbItems = [
    { name: "Home",    url: SITE },
    { name: "Phones",  url: `${SITE}/phones` },
  ];
  if (brand && brandLabel) {
    breadcrumbItems.push({ name: brandLabel, url: `${SITE}/brands/${brand}` });
  }
  breadcrumbItems.push({ name: config.label, url: `${SITE}/phones/budget/${budget}` });
  const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbItems);

  return (
    <div className="page-fade-in">
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/phones" className="hover:text-teal-600">Phones</Link>
        <span>/</span>
        {brandLabel && (
          <>
            <Link href={`/brands/${brand}`} className="hover:text-teal-600">{brandLabel}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700">{config.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
          {brandLabel ? `${brandLabel} ` : ""}Phones {config.label}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {filtered.length} phone{filtered.length !== 1 ? "s" : ""} found
          {brandLabel ? ` from ${brandLabel}` : ""} priced {config.label.toLowerCase()}
          {" "}in Bangladesh
        </p>
      </div>

      {/* Quick-link to other tiers */}
      <div className="mb-6 flex flex-wrap gap-2">
        {relatedTiers.slice(0, 6).map((tier) => {
          const href = brand
            ? `/phones/budget/${brand}-${tier.slug}`
            : `/phones/budget/${tier.slug}`;
          return (
            <Link
              key={tier.slug}
              href={href}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm hover:border-teal-400 hover:text-teal-700 transition-colors"
            >
              {tier.label}
            </Link>
          );
        })}
      </div>

      {/* Phone grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          <p className="text-lg font-semibold">No phones found</p>
          <p className="mt-1 text-sm">
            There are no {brandLabel ? `${brandLabel} ` : ""}phones available {config.label.toLowerCase()}.
          </p>
          <Link
            href="/phones"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Browse All Phones
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((phone) => (
            <PhoneCard key={phone.slug} phone={phone} />
          ))}
        </div>
      )}

      {/* Related brand budget pages (only show on non-brand pages) */}
      {!brand && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-gray-800">
            {config.label} by Brand
          </h2>
          <div className="flex flex-wrap gap-2">
            {["samsung", "xiaomi", "oppo", "realme", "vivo", "nokia", "infinix", "tecno"].map((b) => (
              <Link
                key={b}
                href={`/phones/budget/${b}-${config.slug}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 capitalize shadow-sm hover:border-teal-400 hover:text-teal-700 transition-colors"
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          ← All Phones
        </Link>
        {brandLabel && (
          <Link
            href={`/brands/${brand}`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            All {brandLabel} Phones
          </Link>
        )}
      </div>
    </div>
  );
}
