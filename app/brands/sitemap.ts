import { MetadataRoute } from "next";
import { getAllBrands } from "@/lib/phones";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";
const MAX_URLS = 5000;

export function generateSitemaps() {
  const brands = getAllBrands();
  const count = Math.ceil(brands.length / MAX_URLS);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default function sitemap({
  id,
}: {
  id: number;
}): MetadataRoute.Sitemap {
  const brands = getAllBrands();
  const start = id * MAX_URLS;
  const page = brands.slice(start, start + MAX_URLS);

  return page.map((b) => ({
    url: `${BASE}/brands/${b}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}
