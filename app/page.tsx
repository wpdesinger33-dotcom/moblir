import Link from "next/link";
import { getMergedPhones } from "@/lib/devices";
import { getAllBrands } from "@/lib/phones";
import PhoneCard from "@/components/PhoneCard";
import BrandsSection from "@/components/BrandsSection";

/* ── Inline SVG icons (no emoji) ────────────────────────────────────────── */
function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function IconTablet({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function IconWatch({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l-.5 3h-5L9 3ZM9 21h6l-.5-3h-5L9 21Z" />
    </svg>
  );
}

function IconCompare({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

const CATEGORIES = [
  { label: "Phones",  href: "/phones",  Icon: IconPhone,   desc: "Latest smartphones from all brands" },
  { label: "Tablets", href: "/tablets",  Icon: IconTablet,  desc: "Tablets & iPads" },
  { label: "Watches", href: "/watches",  Icon: IconWatch,   desc: "Smartwatches & wearables" },
  { label: "Compare", href: "/compare",  Icon: IconCompare, desc: "Side-by-side spec comparison" },
];

export default async function HomePage() {
  const [{ phones: featured }, brands] = await Promise.all([
    getMergedPhones({ limit: 8, sort: "featured" }),
    Promise.resolve(getAllBrands()),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GadgetPriceBD",
    url: siteUrl,
    description: "Find the latest mobile phone prices, full specifications, and reviews in Bangladesh.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/phones?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 px-8 py-14 text-white shadow-xl">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 rounded-full bg-teal-500/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-80 w-80 rounded-full bg-teal-500/10" />

        <div className="relative">
          <span className="mb-3 inline-block rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-300">
            Bangladesh&apos;s #1 Mobile Price Guide
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Mobile Price in Bangladesh
          </h1>
          <p className="mt-3 max-w-xl text-gray-300">
            Find the latest mobile phone prices, full specifications, and reviews for
            smartphones, tablets and smartwatches available in Bangladesh. Compare Samsung,
            Xiaomi, Oppo, Realme, Vivo, Apple and more.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/phones" className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-teal-400 transition-colors">
              Explore Best Phones →
            </Link>
            <Link href="/compare" className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-colors border border-white/20">
              Compare Phones
            </Link>
            <Link href="/wishlist" className="rounded-xl bg-rose-500/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-500/30 transition-colors border border-white/20">
              My Wishlist
            </Link>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Categories</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
            >
              <c.Icon className="h-8 w-8 text-teal-600" />
              <p className="font-bold text-gray-800">{c.label}</p>
              <p className="text-xs text-gray-500">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand quick links */}
      <BrandsSection brands={brands} />

      {/* Budget / Price Range quick links */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Shop by Budget</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "Under ৳ 3,000",  href: "/phones/budget/under-3000",  color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400" },
            { label: "Under ৳ 5,000",  href: "/phones/budget/under-5000",  color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400" },
            { label: "Under ৳ 10,000", href: "/phones/budget/under-10000", color: "bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-400" },
            { label: "Under ৳ 15,000", href: "/phones/budget/under-15000", color: "bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-400" },
            { label: "Under ৳ 20,000", href: "/phones/budget/under-20000", color: "bg-cyan-50 border-cyan-200 text-cyan-700 hover:border-cyan-400" },
            { label: "Under ৳ 30,000", href: "/phones/budget/under-30000", color: "bg-cyan-50 border-cyan-200 text-cyan-700 hover:border-cyan-400" },
            { label: "৳ 30k – ৳ 50k",  href: "/phones/budget/30000-to-50000", color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-400" },
            { label: "৳ 50k – ৳ 80k",  href: "/phones/budget/50000-to-80000", color: "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400" },
          ].map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className={`rounded-xl border px-4 py-3 text-center text-sm font-semibold shadow-sm transition-colors ${b.color}`}
            >
              {b.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured phones */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Featured Phones</h2>
          <Link href="/phones" className="text-sm font-semibold text-teal-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((phone) => (
            <PhoneCard key={phone.slug} phone={phone} />
          ))}
        </div>
      </section>
    </div>
  );
}
