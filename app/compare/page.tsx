import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getMergedPhoneDetail } from "@/lib/devices";
import type { DeviceDetail } from "@/lib/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

export const metadata: Metadata = {
  title: "Compare Phones Side by Side – Specs, Price & Features",
  description:
    "Compare mobile phones side by side with full specifications, prices and features in Bangladesh. Find the best smartphone by comparing camera, battery, display and more.",
  keywords: [
    "compare phones bangladesh",
    "phone comparison bd",
    "mobile phone side by side comparison",
    "smartphone specs comparison",
  ],
  alternates: { canonical: `${SITE}/compare` },
};

interface PageProps {
  searchParams: Promise<{ slugs?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { slugs: rawSlugs = "" } = await searchParams;
  const slugList = rawSlugs
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (slugList.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl">⚖️</span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Phone Comparison</h1>
        <p className="mt-2 text-slate-500">
          Select at least 2 phones using the &ldquo;+ Compare&rdquo; button on any phone page.
        </p>
        <Link href="/phones" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Browse Phones →
        </Link>
      </div>
    );
  }

  // Load all phones (gracefully skip missing ones)
  const phones = (
    await Promise.all(slugList.map((s) => getMergedPhoneDetail(s).catch(() => null)))
  ).filter((p): p is DeviceDetail => p !== null);

  if (phones.length < 2) notFound();

  // Collect all unique spec labels across all phones
  const allLabels = Array.from(
    new Set(phones.flatMap((p) => (p.specs ?? []).map((s) => s.label)))
  );

  function getSpec(phone: DeviceDetail, label: string) {
    return phone.specs?.find((s) => s.label === label)?.value ?? "—";
  }

  // Returns true when not all phones share the same value for this spec (highlight difference)
  function isDifferent(label: string) {
    const vals = phones.map((p) => getSpec(p, label));
    return new Set(vals).size > 1;
  }

  const compareFields: { key: keyof DeviceDetail; label: string }[] = [
    { key: "price",    label: "Price" },
    { key: "brand",    label: "Brand" },
    { key: "released", label: "Released" },
    { key: "category", label: "Category" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Compare Phones</h1>
        <p className="mt-1 text-sm text-slate-500">
          Comparing {phones.length} phones side by side &middot;{" "}
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-yellow-100 border border-yellow-300" />
            highlighted rows differ between phones
          </span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          {/* Phone headers */}
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-40 px-4 py-4 text-left text-slate-500">Feature</th>
              {phones.map((p) => (
                <th key={p.slug} className="px-4 py-4 text-center">
                  <Link href={`/phones/${p.slug}`} className="block hover:opacity-80">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={80}
                      height={100}
                      className="mx-auto h-20 w-auto object-contain"
                      unoptimized
                    />
                    <p className="mt-1 text-xs font-bold text-blue-600">{p.brand}</p>
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <p className="mt-0.5 text-base font-bold text-blue-700">{p.price}</p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Core fields */}
            {compareFields.map(({ key, label }) => {
              const vals = phones.map((p) => String(p[key]));
              const diff = new Set(vals).size > 1;
              return (
                <tr key={key} className={`hover:bg-slate-50 ${diff ? "bg-yellow-50" : ""}`}>
                  <td className={`px-4 py-3 font-medium ${diff ? "text-yellow-800" : "text-slate-600"}`}>
                    {label}
                    {diff && <span className="ml-1 text-yellow-500">●</span>}
                  </td>
                  {phones.map((p) => (
                    <td key={p.slug} className="px-4 py-3 text-center text-slate-800">
                      {key === "price" ? (
                        <span className="font-bold text-blue-700">{String(p[key])}</span>
                      ) : (
                        String(p[key])
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Spec rows */}
            {allLabels.map((label, li) => {
              const diff = isDifferent(label);
              return (
                <tr key={li} className={`hover:bg-slate-50 ${diff ? "bg-yellow-50" : ""}`}>
                  <td className={`px-4 py-3 font-medium ${diff ? "text-yellow-800" : "text-slate-600"}`}>
                    {label}
                    {diff && <span className="ml-1 text-yellow-500">●</span>}
                  </td>
                  {phones.map((p) => {
                    const val = getSpec(p, label);
                    return (
                      <td key={p.slug} className={`px-4 py-3 text-center ${val === "—" ? "text-slate-300" : "text-slate-700"}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/phones" className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          ← Back to Phones
        </Link>
      </div>
    </div>
  );
}
