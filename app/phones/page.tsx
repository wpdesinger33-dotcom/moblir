import { Suspense } from "react";
import type { Metadata } from "next";
import { getMergedPhones } from "@/lib/devices";
import PhoneCard from "@/components/PhoneCard";
import SearchFilter from "@/components/SearchFilter";
import Pagination from "@/components/Pagination";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

export const metadata: Metadata = {
  title: "Mobile Phone Price in Bangladesh 2025 – All Brands",
  description:
    "Browse all mobile phone prices, full specifications and reviews in Bangladesh. Filter by brand, price range, or features. Compare Samsung, Xiaomi, Oppo, Vivo, Realme, Apple and more smartphones.",
  keywords: [
    "mobile phone price in bangladesh",
    "smartphone price list bd",
    "all mobile price in bangladesh 2025",
    "samsung phone price",
    "xiaomi phone price",
    "oppo phone price bd",
    "budget phone bangladesh",
  ],
  alternates: { canonical: `${SITE}/phones` },
};

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    q?: string;
    sort?: string;
    range?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function PhonesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page  = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;

  const { phones, total, pages, apiAvailable } = await getMergedPhones({
    brand:    sp.brand,
    q:        sp.q,
    sort:     sp.sort,
    range:    sp.range,
    category: "phone",
    page,
    limit,
    minPrice: sp.minPrice ? parseInt(sp.minPrice, 10) : undefined,
    maxPrice: sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Mobile Phone Price in Bangladesh</h1>
        <p className="mt-1 text-sm text-slate-600">
          Compare the latest smartphone prices in Bangladesh from Samsung, Xiaomi, Oppo, Vivo, Realme, Apple and more.
          Find full specifications, reviews, and the best deals on budget and flagship phones.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {total} phone{total !== 1 ? "s" : ""} found
          {apiAvailable && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              ● Live API
            </span>
          )}
        </p>
      </div>

      <Suspense>
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <SearchFilter />
        </div>
      </Suspense>

      {phones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No phones match your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {phones.map((phone) => (
              <PhoneCard key={phone.slug} phone={phone} />
            ))}
          </div>
          <Suspense>
            <Pagination page={page} pages={pages} total={total} />
          </Suspense>
        </>
      )}
    </div>
  );
}
