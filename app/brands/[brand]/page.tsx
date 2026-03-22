import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllBrands } from "@/lib/phones";
import { getMergedPhones } from "@/lib/devices";
import PhoneCard from "@/components/PhoneCard";
import { buildBreadcrumbJsonLd } from "@/lib/seo-helpers";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

interface PageProps {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams() {
  return getAllBrands().map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const display = brand.charAt(0).toUpperCase() + brand.slice(1);
  return {
    title: `${display} Phone Price in Bangladesh 2025 – All Models`,
    description: `Browse all ${display} mobile phones with latest prices and full specifications in Bangladesh. Compare ${display} smartphones, find reviews and the best deals.`,
    keywords: [
      `${display} phone price in bangladesh`,
      `${display} mobile price bd`,
      `${display} smartphone specifications`,
      `${display} phone review bangladesh`,
      `best ${display} phone bangladesh`,
    ],
    alternates: { canonical: `${SITE}/brands/${brand}` },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params;
  const { phones } = await getMergedPhones({ brand, limit: 100 });
  if (phones.length === 0) notFound();

  const display = brand.charAt(0).toUpperCase() + brand.slice(1);

  const featurePhoneCount = phones.filter((p) => p.category === "feature-phone").length;
  const smartphoneCount   = phones.filter((p) => p.category !== "feature-phone").length;
  const allFeaturePhones  = featurePhoneCount === phones.length;

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home",   url: SITE },
    { name: "Phones", url: `${SITE}/phones` },
    { name: display,  url: `${SITE}/brands/${brand}` },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/phones" className="hover:text-teal-600">Phones</Link>
        <span>/</span>
        <span className="text-gray-700">{display}</span>
      </nav>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900">{display} Phone Price in Bangladesh</h1>
          {allFeaturePhones && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              Button / Feature Phones
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {phones.length} model{phones.length !== 1 ? "s" : ""} available
          {!allFeaturePhones && featurePhoneCount > 0 && (
            <span className="ml-2 text-gray-400">
              ({smartphoneCount} smartphone{smartphoneCount !== 1 ? "s" : ""}, {featurePhoneCount} button phone{featurePhoneCount !== 1 ? "s" : ""})
            </span>
          )}
        </p>
        {allFeaturePhones && (
          <p className="mt-1 text-xs text-orange-600">
            All {display} models listed here are button / feature phones — not Android smartphones.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {phones.map((phone) => (
          <PhoneCard key={phone.slug} phone={phone} />
        ))}
      </div>

      <div className="mt-8">
        <Link href="/phones" className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          ← All Phones
        </Link>
      </div>
    </div>
  );
}
