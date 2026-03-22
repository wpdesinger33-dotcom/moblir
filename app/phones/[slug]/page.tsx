import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getMergedPhoneDetail } from "@/lib/devices";
import { getAllPhoneSlugs } from "@/lib/phones";
import { priceRangeLabel, priceRangeClass, parsePriceBreakdown } from "@/lib/price";
import PhoneActions from "@/components/PhoneActions";
import type { SpecEntry } from "@/lib/types";
import {
  generatePhoneDescription,
  generatePhoneFAQ,
  buildBreadcrumbJsonLd,
  buildFAQJsonLd,
} from "@/lib/seo-helpers";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── SVG icon components (replacing emoji) ─────────────────────────────────────
function IconDisplay({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
  );
}

function IconCamera({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  );
}

function IconBattery({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0 0 21 15.75v-6a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 1.5 9.75v6A2.25 2.25 0 0 0 3.75 18Z" />
    </svg>
  );
}

function IconRam({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function IconProcessor({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
    </svg>
  );
}

function IconStorage({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Display: IconDisplay,
  Camera: IconCamera,
  Battery: IconBattery,
  RAM: IconRam,
  Processor: IconProcessor,
  Storage: IconStorage,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Spec helpers ──────────────────────────────────────────────────────────────

/** Return the first spec whose label matches any keyword (case-insensitive). */
function pickSpec(specs: SpecEntry[], keywords: string[]): string {
  return (
    specs.find((s) => keywords.some((kw) => s.label.toLowerCase().includes(kw)))
      ?.value ?? ""
  );
}

/** Quick-highlight cards shown between hero and full spec table. */
const QUICK_SPECS: { label: string; keywords: string[] }[] = [
  { label: "Display", keywords: ["display", "screen"] },
  { label: "Camera", keywords: ["main camera", "rear camera"] },
  { label: "Battery", keywords: ["battery"] },
  { label: "RAM", keywords: ["ram"] },
  { label: "Processor", keywords: ["processor", "chipset", "cpu"] },
  { label: "Storage", keywords: ["storage", "rom"] },
];

/** Category grouping for the full spec table. Order matters: first match wins. */
const SPEC_GROUPS: { name: string; keywords: string[] }[] = [
  { name: "Display", keywords: ["display", "screen", "panel", "resolution", "refresh", "brightness", "ppi"] },
  { name: "Platform", keywords: ["processor", "chipset", "cpu", "gpu", "soc", "os", "android", "software"] },
  { name: "Memory", keywords: ["ram", "storage", "rom", "memory"] },
  { name: "Camera", keywords: ["camera", "video"] },
  { name: "Battery", keywords: ["battery", "charging"] },
  { name: "Connectivity", keywords: ["network", "sim", "wifi", "wlan", "bluetooth", "nfc", "usb", "gps", "infrared"] },
  { name: "Design", keywords: ["dimensions", "weight", "colors", "colour", "build", "ip"] },
];

function groupSpecs(specs: SpecEntry[]): { name: string; specs: SpecEntry[] }[] {
  const used = new Set<string>();
  const groups: { name: string; specs: SpecEntry[] }[] = [];

  for (const group of SPEC_GROUPS) {
    const matched = specs.filter(
      (s) =>
        !used.has(s.label) &&
        group.keywords.some((kw) => s.label.toLowerCase().includes(kw)),
    );
    if (matched.length) {
      matched.forEach((s) => used.add(s.label));
      groups.push({ name: group.name, specs: matched });
    }
  }

  // Ungrouped specs are appended at the end as "General"
  const remaining = specs.filter((s) => !used.has(s.label));
  if (remaining.length) {
    groups.push({ name: "General", specs: remaining });
  }

  return groups;
}

// ── Rating helpers ────────────────────────────────────────────────────────────

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateCategoryRatings(
  slug: string,
  priceRange: string,
): { label: string; score: number; color: string }[] {
  const hash = hashCode(slug);
  const base = priceRange === "Flagship" ? 8.0 : priceRange === "Mid-range" ? 7.0 : 6.5;
  const categories = [
    { label: "Battery",     color: "#22c55e" },
    { label: "Camera",      color: "#3b82f6" },
    { label: "Performance", color: "#f59e0b" },
    { label: "Display",     color: "#8b5cf6" },
    { label: "Design",      color: "#ec4899" },
    { label: "Value",       color: "#06b6d4" },
  ];
  return categories.map((cat, i) => {
    const offset = ((hash >> (i * 4)) % 15) / 10;
    return { ...cat, score: Math.min(10, Math.round((base + offset) * 10) / 10) };
  });
}

function generateProsAndCons(
  specs: SpecEntry[],
  priceRange: string,
): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  const hasText = (kw: string) =>
    specs.some(
      (s) =>
        s.value.toLowerCase().includes(kw) ||
        s.label.toLowerCase().includes(kw),
    );

  if (hasText("amoled") || hasText("oled"))      pros.push("Vibrant AMOLED/OLED display");
  if (hasText("120hz") || hasText("144hz"))       pros.push("Smooth high refresh rate display");
  if (hasText("5g"))                               pros.push("5G network support");
  if (hasText("nfc"))                              pros.push("NFC for contactless payments");
  if (hasText("gorilla"))                          pros.push("Gorilla Glass protection");
  if (hasText("stereo"))                           pros.push("Stereo speakers");
  if (hasText("fast charg"))                       pros.push("Fast charging support");
  if (hasText("water") || hasText("ip68") || hasText("ip67"))
    pros.push("Water and dust resistance");

  if (priceRange === "Budget") {
    pros.push("Excellent value for money");
    cons.push("Limited processing power for heavy tasks");
    cons.push("Basic camera in low-light conditions");
    cons.push("Plastic build material");
  } else if (priceRange === "Mid-range") {
    pros.push("Good balance of features and price");
    cons.push("Average low-light photography");
    cons.push("No wireless charging support");
  } else {
    pros.push("Premium build quality and materials");
    pros.push("Top-tier camera system");
    cons.push("Premium price point");
    cons.push("Can be heavy for prolonged one-hand use");
  }

  if (!hasText("3.5mm") && !hasText("headphone jack")) cons.push("No 3.5mm headphone jack");
  if (!hasText("microsd") && !hasText("sd card"))       cons.push("No expandable storage");

  return {
    pros: [...new Set(pros)].slice(0, 5),
    cons: [...new Set(cons)].slice(0, 5),
  };
}

/** Extract Positive / Mixed / Negative review counts from parsed specs. */
function extractReviewCounts(specs: SpecEntry[]): { positive: number; mixed: number; negative: number } {
  const find = (label: string) =>
    parseInt(specs.find((s) => s.label.toLowerCase() === label)?.value ?? "0", 10) || 0;
  return { positive: find("positive:"), mixed: find("mixed:"), negative: find("negative:") };
}

/**
 * Compute a deterministic editorial rating (3.0–5.0) from the phone slug +
 * price range when no real review votes exist.
 * Uses 21 hash buckets to spread scores ±0.10 around the tier base.
 */
function editorialRating(slug: string, priceRange: string): number {
  const BUCKETS    = 21;   // odd count → symmetric ±0.10 range
  const HALF_RANGE = 10;   // centre bucket; offset gives range [-10, +10]
  const SCALE      = 100;  // divide by 100 → ±0.10 float tweak

  const base = priceRange === "Flagship" ? 4.3 : priceRange === "Mid-range" ? 4.0 : 3.6;
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const tweak = ((hash % BUCKETS) - HALF_RANGE) / SCALE;
  return parseFloat(Math.min(5.0, Math.max(3.0, base + tweak)).toFixed(1));
}

/** Render filled / half / empty stars. */
function StarRow({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.3 && rating - full < 0.8;
  const empty = 5 - full - (half ? 1 : 0);
  const Star  = ({ fill }: { fill: "full" | "half" | "empty" }) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      {fill === "full" && (
        <path fill="#f59e0b" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      )}
      {fill === "half" && (
        <>
          <path fill="#f59e0b" d="M12 2v15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          <path fill="#e5e7eb" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
        </>
      )}
      {fill === "empty" && (
        <path fill="#e5e7eb" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      )}
    </svg>
  );
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => <Star key={`f${i}`} fill="full"  />)}
      {half  && <Star key="h" fill="half"  />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} fill="empty" />)}
    </div>
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllPhoneSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const phone = await getMergedPhoneDetail(slug);
  if (!phone) return { title: "Phone not found" };

  const specs = phone.specs ?? [];
  const description = generatePhoneDescription(
    phone.name, phone.brand, phone.price, phone.released, specs,
  ).slice(0, 320);

  return {
    title: `${phone.name} Price in Bangladesh`,
    description,
    keywords: [phone.name, phone.brand, "price bangladesh", "specifications", ...(phone.tags ?? [])],
    openGraph: {
      title: `${phone.name} – ${phone.price} | GadgetPriceBD`,
      description,
      images: [
        {
          url: phone.image.startsWith("/")
            ? `${SITE}${phone.image}`
            : phone.image,
          width: 300,
          height: 420,
          alt: phone.name,
        },
      ],
    },
    alternates: { canonical: `${SITE}/phones/${slug}` },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PhonePage({ params }: PageProps) {
  const { slug } = await params;
  const phone = await getMergedPhoneDetail(slug);
  if (!phone) notFound();

  const range      = priceRangeLabel(phone.price);
  const rangeClass = priceRangeClass(range);
  const specs      = phone.specs ?? [];
  const specGroups = groupSpecs(specs);
  const quickSpecs = QUICK_SPECS.map((qs) => ({
    label: qs.label,
    value: pickSpec(specs, qs.keywords),
  })).filter((qs) => qs.value);

  // Parse structured price breakdown from raw data
  const priceInfo = parsePriceBreakdown(phone.rawPrice ?? phone.price);

  // Rating data
  const reviews    = extractReviewCounts(specs);
  const totalVotes = reviews.positive + reviews.mixed + reviews.negative;
  let rating: number;
  if (totalVotes > 0) {
    // Weighted average: positive=5pts, mixed=3pts, negative=1pt → normalise to 0–5
    const weightedSum     = reviews.positive * 5 + reviews.mixed * 3 + reviews.negative * 1;
    const maxPossibleSum  = totalVotes * 5;
    const normalizedScore = (weightedSum / maxPossibleSum) * 5;
    rating = parseFloat(Math.min(5, normalizedScore).toFixed(1));
  } else {
    rating = editorialRating(phone.slug, range);
  }
  const isEditorial = totalVotes === 0;

  // Category ratings & pros/cons (shown on detail page)
  const categoryRatings = generateCategoryRatings(phone.slug, range);
  const overallScore    = Math.round(
    (categoryRatings.reduce((sum, r) => sum + r.score, 0) / categoryRatings.length) * 10,
  ) / 10;
  const { pros, cons } = generateProsAndCons(specs, range);

  // Generate dynamic description and FAQ from specs
  const dynamicDesc = generatePhoneDescription(
    phone.name, phone.brand, phone.price, phone.released, specs,
  );
  const faqItems = generatePhoneFAQ(
    phone.name, phone.brand, phone.price, phone.released, specs,
  );

  const imageUrl = phone.image.startsWith("/")
    ? `${SITE}${phone.image}`
    : phone.image;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: phone.name,
    brand: { "@type": "Brand", name: phone.brand },
    description: dynamicDesc.slice(0, 500),
    image: imageUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: phone.priceNum > 0 ? phone.priceNum : undefined,
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home",       url: SITE },
    { name: "Phones",     url: `${SITE}/phones` },
    { name: phone.brand,  url: `${SITE}/brands/${phone.brandSlug}` },
    { name: phone.name,   url: `${SITE}/phones/${slug}` },
  ]);

  const faqLd = faqItems.length > 0 ? buildFAQJsonLd(faqItems) : null;

  return (
    <div className="mx-auto max-w-5xl page-fade-in">
      {/* JSON-LD: Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* JSON-LD: FAQ */}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/phones" className="hover:text-teal-600">Phones</Link>
        <span>/</span>
        <Link href={`/brands/${phone.brandSlug}`} className="capitalize hover:text-teal-600">
          {phone.brand}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{phone.name}</span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid lg:grid-cols-[320px_1fr]">

        {/* Image panel */}
        <div className="flex items-center justify-center bg-gray-50 p-8 lg:border-r lg:border-gray-200">
          <Image
            src={phone.image}
            alt={`${phone.name} price in Bangladesh - ${phone.brand} specifications`}
            width={260}
            height={340}
            className="h-64 w-auto object-contain drop-shadow-md sm:h-72"
            unoptimized
            priority
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          {/* Brand + source badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/brands/${phone.brandSlug}`}
              className="rounded-full bg-teal-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-teal-700"
            >
              {phone.brand}
            </Link>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${rangeClass}`}>
              {range}
            </span>
            {phone.source === "api" && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                ● New
              </span>
            )}
            {phone.featured && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                ★ Featured
              </span>
            )}
          </div>

          {/* Phone name */}
          <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
            {phone.name}
          </h1>

          {/* Price section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-4">
              <div className="rounded-xl bg-teal-600 px-5 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">
                  {priceInfo.priceLabel ?? "Price"}
                </p>
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{priceInfo.displayPrice}</p>
                {priceInfo.originalPrice && (
                  <p className="mt-0.5 text-sm text-teal-200 line-through">{priceInfo.originalPrice}</p>
                )}
                {priceInfo.discount && (
                  <p className="mt-0.5 text-xs font-semibold text-emerald-300">{priceInfo.discount}</p>
                )}
              </div>
              {priceInfo.unofficialPrice && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unofficial
                  </p>
                  <p className="text-xl font-bold text-gray-800">{priceInfo.unofficialPrice}</p>
                </div>
              )}
              <div className="mb-1 text-sm text-gray-500">
                <p className="text-xs uppercase tracking-wide">Released</p>
                <p className="font-semibold text-gray-700">
                  {phone.released && phone.released !== "N/A"
                    ? (() => {
                        const d = new Date(phone.released);
                        if (!isNaN(d.getTime())) {
                          // Full date available → show "3 Feb 2025"; year-only → show "2025"
                          return phone.released.length > 4
                            ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                            : phone.released;
                        }
                        return phone.released;
                      })()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Variant prices */}
            {priceInfo.variants.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Variant Prices</p>
                <div className="flex flex-wrap gap-2">
                  {priceInfo.variants.map((v) => (
                    <div key={`${v.name}-${v.priceNum}`} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm">
                      <span className="font-medium text-gray-700">{v.name}</span>
                      <span className="ml-2 font-bold text-teal-700">{v.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {phone.tags && phone.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {phone.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Rating widget ─────────────────────────────────────────── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">
              {isEditorial ? "Editorial Rating" : "User Ratings"}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* Score */}
              <div className="text-center">
                <p className="text-4xl font-extrabold leading-none text-amber-500">{rating.toFixed(1)}</p>
                <p className="mt-0.5 text-xs text-gray-500">out of 5</p>
              </div>

              {/* Stars + label */}
              <div>
                <StarRow rating={rating} />
                <p className="mt-1 text-xs text-gray-500">
                  {isEditorial
                    ? "Based on specifications & value"
                    : `${totalVotes} user review${totalVotes !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Bar breakdown (only when real votes exist) */}
              {totalVotes > 0 && (
                <div className="ml-auto flex flex-col gap-1.5 text-xs min-w-0">
                  {[
                    { label: "Positive", count: reviews.positive, color: "bg-green-500" },
                    { label: "Mixed",    count: reviews.mixed,    color: "bg-amber-400" },
                    { label: "Negative", count: reviews.negative, color: "bg-red-400"   },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-14 text-right text-gray-500">{label}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${color} transition-all`}
                          style={{ width: `${totalVotes > 0 ? (count / totalVotes) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-4 text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            <PhoneActions
              slug={phone.slug}
              name={phone.name}
              image={phone.image}
              price={phone.price}
              brand={phone.brand}
            />
            <Link
              href={`/brands/${phone.brandSlug}`}
              className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100"
            >
              More {phone.brand} phones →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick-spec highlight cards ────────────────────────────────────── */}
      {quickSpecs.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickSpecs.map((qs, qi) => {
            const SpecIcon = ICON_MAP[qs.label] ?? IconDisplay;
            return (
              <div
                key={qi}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm"
              >
                <SpecIcon className="h-6 w-6 text-teal-600" />
                <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
                  {qs.label}
                </p>
                <p className="line-clamp-3 text-xs leading-relaxed text-gray-700">{qs.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full specifications ───────────────────────────────────────────── */}
      {specs.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Table heading */}
          <div className="bg-teal-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white">{phone.name} – Full Specifications</h2>
          </div>

          {/* Grouped rows */}
          {specGroups.map((group, gi) => (
            <div key={gi}>
              <div className="border-b border-t border-gray-200 bg-gray-50 px-6 py-2">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                  {group.name}
                </p>
              </div>
              <dl>
                {group.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`flex gap-4 px-6 py-3 text-sm ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    }`}
                  >
                    <dt className="w-36 shrink-0 font-medium text-gray-500 sm:w-44">
                      {spec.label}
                    </dt>
                    <dd className="flex-1 text-gray-800">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* ── Rating Breakdown ─────────────────────────────────────────────── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Rating Breakdown</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-teal-600">{overallScore}</span>
            <span className="text-sm text-gray-400">/ 10</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {categoryRatings.map((r, ri) => (
            <div key={ri}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">{r.label}</span>
                <span className="font-bold" style={{ color: r.color }}>{r.score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${r.score * 10}%`, backgroundColor: r.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pros & Cons ──────────────────────────────────────────────────── */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pros.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
              <div className="border-b border-green-100 bg-green-50 px-5 py-3">
                <h2 className="font-bold text-green-700">✅ Pros</h2>
              </div>
              <ul className="divide-y divide-gray-50 px-5 py-2">
                {pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 py-2.5 text-sm text-gray-700">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
              <div className="border-b border-red-100 bg-red-50 px-5 py-3">
                <h2 className="font-bold text-red-600">❌ Cons</h2>
              </div>
              <ul className="divide-y divide-gray-50 px-5 py-2">
                {cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 py-2.5 text-sm text-gray-700">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Dynamic description (generated from specs) ─────────────────── */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{phone.name} Overview</h2>
        <p className="text-sm leading-relaxed text-gray-700">{dynamicDesc}</p>
      </div>

      {/* ── Long-form description / HTML content ─────────────────────────── */}
      {phone.contentHtml && (
        <div
          className="prose mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          dangerouslySetInnerHTML={{ __html: phone.contentHtml }}
        />
      )}

      {/* Fallback: plain description when there are no parsed specs or HTML */}
      {!specs.length && !phone.contentHtml && phone.description && (
        <div className="prose mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p>{phone.description}</p>
        </div>
      )}

      {/* ── FAQ section ──────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {faqItems.map((faq) => (
              <details key={faq.question} className="group px-6 py-4">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-800 group-open:text-teal-700">
                  {faq.question}
                  <svg className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom navigation ─────────────────────────────────────────────── */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          ← All Phones
        </Link>
        <Link
          href={`/brands/${phone.brandSlug}`}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          More {phone.brand}
        </Link>
      </div>
    </div>
  );
}
