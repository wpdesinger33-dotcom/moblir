import { MetadataRoute } from "next";
import { getAllPhoneSlugs, getAllBrands } from "@/lib/phones";
import { getAllBudgetSlugs } from "@/lib/budget-pages";
import { getAllBlogSlugs } from "@/lib/blog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";
const MAX_URLS = 100;

function pages(count: number) {
  return Array.from({ length: count }, (_, i) => i);
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  let blogSlugs: string[] = [];
  try {
    blogSlugs = await getAllBlogSlugs();
  } catch {
    /* blog unavailable – omit from robots */
  }

  const phonePages  = Math.ceil(getAllPhoneSlugs().length  / MAX_URLS);
  const brandPages  = Math.ceil(getAllBrands().length       / MAX_URLS);
  const budgetPages = Math.ceil(getAllBudgetSlugs().length  / MAX_URLS);
  const blogPages   = Math.ceil(blogSlugs.length           / MAX_URLS);

  const phoneSitemaps  = pages(phonePages) .map((i) => `${BASE}/phones/sitemap/${i}.xml`);
  const brandSitemaps  = pages(brandPages) .map((i) => `${BASE}/brands/sitemap/${i}.xml`);
  const budgetSitemaps = pages(budgetPages).map((i) => `${BASE}/phones/budget/sitemap/${i}.xml`);
  const blogSitemaps   = pages(blogPages)  .map((i) => `${BASE}/blog/sitemap/${i}.xml`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: [
      `${BASE}/sitemap.xml`,
      ...blogSitemaps,
      ...budgetSitemaps,
      ...brandSitemaps,
      ...phoneSitemaps,
    ],
  };
}
