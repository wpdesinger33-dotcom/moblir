import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getMergedPhones } from "@/lib/devices";
import PhoneCard from "@/components/PhoneCard";
import SearchFilter from "@/components/SearchFilter";
import Pagination from "@/components/Pagination";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

export const metadata: Metadata = {
  title: "Smartwatch Price in Bangladesh 2025 – Apple Watch, Galaxy Watch & More",
  description:
    "Browse smartwatch prices and full specifications in Bangladesh. Compare Apple Watch, Samsung Galaxy Watch, Amazfit, Xiaomi and more wearables.",
  keywords: [
    "smartwatch price in bangladesh",
    "apple watch price bd",
    "samsung galaxy watch price bangladesh",
    "smart watch price bd",
    "fitness tracker bangladesh",
  ],
  alternates: { canonical: `${SITE}/watches` },
};

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    q?: string;
    sort?: string;
    range?: string;
    page?: string;
  }>;
}

export default async function WatchesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page  = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;

  const { phones: watches, total, pages, apiAvailable } = await getMergedPhones({
    brand:    sp.brand,
    q:        sp.q,
    sort:     sp.sort,
    range:    sp.range,
    category: "watch",
    page,
    limit,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Smartwatch Price in Bangladesh</h1>
        <p className="mt-1 text-sm text-slate-600">
          Explore smartwatch prices and specifications in Bangladesh including Apple Watch, Samsung Galaxy Watch, and more wearables.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {total} watch{total !== 1 ? "es" : ""} found
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

      {watches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
          <span className="text-6xl">⌚</span>
          <h2 className="mt-4 text-xl font-bold text-slate-700">No smartwatches yet</h2>
          <p className="mt-2 text-slate-500">
            Run the scraper with{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">--category watch</code>{" "}
            to populate smartwatch data.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ← Back to Home
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {watches.map((watch) => (
              <PhoneCard key={watch.slug} phone={watch} />
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
