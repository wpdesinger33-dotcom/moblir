import { MetadataRoute } from "next";
import { getAllBrands, getAllPhoneSlugs } from "@/lib/phones";
import { getAllBlogSlugs } from "@/lib/blog";
import { getAllBudgetSlugs } from "@/lib/budget-pages";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://bestmobilelist.com";

const LIMIT = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = getAllBrands();
  const budgetSlugs = getAllBudgetSlugs();

  let phoneSlugs: string[] = [];
  try {
    phoneSlugs = getAllPhoneSlugs();
  } catch {}

  let blogSlugs: string[] = [];
  try {
    blogSlugs = await getAllBlogSlugs();
  } catch {}

  return [
    {
      url: BASE,
      lastModified: new Date(),
    },
    {
      url: `${BASE}/phones`,
      lastModified: new Date(),
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
    },

  
    ...phoneSlugs.map((slug) => ({
      url: `${BASE}/phones/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),

    ...brands.map((b) => ({
      url: `${BASE}/brands/${b}`,
      lastModified: new Date(),
    })),

    ...budgetSlugs.map((b) => ({
      url: `${BASE}/phones/budget/${b}`,
      lastModified: new Date(),
    })),

    ...blogSlugs.map((s) => ({
      url: `${BASE}/blog/${s}`,
      lastModified: new Date(),
    })),
  ].slice(0, LIMIT);
}