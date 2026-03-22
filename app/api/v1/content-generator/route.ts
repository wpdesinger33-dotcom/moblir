import { NextRequest, NextResponse } from "next/server";
import { getAllPhoneSummaries } from "@/lib/phones";
import type { DeviceSummary } from "@/lib/types";

function requireAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return (
    req.cookies.get("admin_token")?.value === secret ||
    req.headers.get("x-admin-secret") === secret ||
    req.headers.get("authorization") === `Bearer ${secret}`
  );
}

/* ── Template generators ────────────────────────────────────────────────── */

interface GeneratedContent {
  type: "blog" | "phone";
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
}

function generateBudgetRoundup(
  label: string,
  maxPrice: number,
  phones: DeviceSummary[],
): GeneratedContent {
  const filtered = phones
    .filter((p) => p.priceNum > 0 && p.priceNum < maxPrice)
    .sort((a, b) => b.priceNum - a.priceNum)
    .slice(0, 10);

  const slug = `best-phones-under-${maxPrice}-in-bangladesh-${new Date().getFullYear()}`;
  const title = `Best Phones ${label} in Bangladesh (${new Date().getFullYear()})`;

  let content = `Looking for the best smartphone ${label.toLowerCase()} in Bangladesh? We have compiled a list of the top options currently available, based on specifications, value for money, and user reviews.\n\n`;
  content += `## Top ${filtered.length} Phones ${label}\n\n`;

  if (filtered.length === 0) {
    content += `No phones are currently available in this price range. Check back soon as we update our database regularly.\n`;
  } else {
    filtered.forEach((p, i) => {
      content += `### ${i + 1}. ${p.name}\n\n`;
      content += `- **Brand**: ${p.brand}\n`;
      content += `- **Price**: ${p.price}\n`;
      content += `- **Released**: ${p.released}\n`;
      content += `- **Category**: ${p.priceRange}\n\n`;
      content += `Check full specifications of [${p.name}](/phones/${p.slug}).\n\n`;
    });
  }

  content += `## How We Pick Our Recommendations\n\n`;
  content += `We consider processor performance, display quality, camera capabilities, battery life, and overall build quality when selecting our top picks. All prices are sourced from official and unofficial channels in Bangladesh.\n\n`;
  content += `Browse all [phones ${label.toLowerCase()}](/phones/budget/under-${maxPrice}) on GadgetPriceBD.\n`;

  return {
    type: "blog",
    title,
    slug,
    content,
    excerpt: `Our top picks for the best smartphones ${label.toLowerCase()} in Bangladesh, ranked by value for money and specifications.`,
    category: "Buying Guide",
    tags: ["best phones", label.toLowerCase(), "bangladesh", "buying guide"],
  };
}

function generateBrandRoundup(
  brand: string,
  phones: DeviceSummary[],
): GeneratedContent {
  const brandPhones = phones
    .filter((p) => p.brandSlug === brand.toLowerCase())
    .sort((a, b) => b.priceNum - a.priceNum)
    .slice(0, 15);

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const slug = `all-${brand}-phones-price-in-bangladesh-${new Date().getFullYear()}`;
  const title = `All ${brandName} Phones Price in Bangladesh (${new Date().getFullYear()})`;

  let content = `Here is a complete list of ${brandName} phones currently available in Bangladesh with their latest prices and key specifications.\n\n`;
  content += `## ${brandName} Phone Lineup\n\n`;

  if (brandPhones.length === 0) {
    content += `No ${brandName} phones found in our database. Check back soon.\n`;
  } else {
    const flagship = brandPhones.filter((p) => p.priceRange === "Flagship");
    const midRange = brandPhones.filter((p) => p.priceRange === "Mid-range");
    const budget = brandPhones.filter((p) => p.priceRange === "Budget");

    if (flagship.length > 0) {
      content += `### Flagship (Above ৳80,000)\n\n`;
      flagship.forEach((p) => {
        content += `- **[${p.name}](/phones/${p.slug})** - ${p.price}\n`;
      });
      content += `\n`;
    }

    if (midRange.length > 0) {
      content += `### Mid-Range (৳30,000 - ৳80,000)\n\n`;
      midRange.forEach((p) => {
        content += `- **[${p.name}](/phones/${p.slug})** - ${p.price}\n`;
      });
      content += `\n`;
    }

    if (budget.length > 0) {
      content += `### Budget (Under ৳30,000)\n\n`;
      budget.forEach((p) => {
        content += `- **[${p.name}](/phones/${p.slug})** - ${p.price}\n`;
      });
      content += `\n`;
    }
  }

  content += `\nVisit the [${brandName} brand page](/brands/${brand}) for the full list.\n`;

  return {
    type: "blog",
    title,
    slug,
    content,
    excerpt: `Complete list of ${brandName} phones available in Bangladesh with prices, grouped by budget, mid-range, and flagship.`,
    category: "Brand Roundup",
    tags: [brand, "phones", "price list", "bangladesh"],
  };
}

function generateComparisonPost(
  phones: DeviceSummary[],
): GeneratedContent {
  const samsung = phones.filter((p) => p.brandSlug === "samsung" && p.priceNum > 30000).slice(0, 5);
  const xiaomi = phones.filter((p) => p.brandSlug === "xiaomi" && p.priceNum > 30000).slice(0, 5);

  const slug = `samsung-vs-xiaomi-phones-comparison-${new Date().getFullYear()}`;
  const title = `Samsung vs Xiaomi: Phone Comparison ${new Date().getFullYear()}`;

  let content = `Samsung and Xiaomi are the two most popular smartphone brands in Bangladesh. Here is how their current lineups compare.\n\n`;

  content += `## Samsung Phones\n\n`;
  if (samsung.length > 0) {
    samsung.forEach((p) => {
      content += `- **[${p.name}](/phones/${p.slug})** - ${p.price} (${p.priceRange})\n`;
    });
  } else {
    content += `No Samsung phones above ৳30,000 found.\n`;
  }

  content += `\n## Xiaomi Phones\n\n`;
  if (xiaomi.length > 0) {
    xiaomi.forEach((p) => {
      content += `- **[${p.name}](/phones/${p.slug})** - ${p.price} (${p.priceRange})\n`;
    });
  } else {
    content += `No Xiaomi phones above ৳30,000 found.\n`;
  }

  content += `\n## Verdict\n\n`;
  content += `Both brands offer excellent options. Samsung typically wins on display quality and software support, while Xiaomi offers better value for money. Compare specific models using our [compare tool](/compare).\n`;

  return {
    type: "blog",
    title,
    slug,
    content,
    excerpt: `A head-to-head comparison of Samsung and Xiaomi phones currently available in Bangladesh.`,
    category: "Comparison",
    tags: ["samsung", "xiaomi", "comparison", "bangladesh"],
  };
}

function generateNewArrivalsPost(
  phones: DeviceSummary[],
): GeneratedContent {
  const recent = phones
    .filter((p) => p.released >= "2024")
    .sort((a, b) => b.released.localeCompare(a.released))
    .slice(0, 12);

  const slug = `latest-phones-bangladesh-${new Date().getFullYear()}`;
  const title = `Latest Phones in Bangladesh (${new Date().getFullYear()})`;

  let content = `Here are the newest smartphones that have arrived in the Bangladesh market.\n\n`;

  if (recent.length === 0) {
    content += `No recent arrivals found. Check back soon.\n`;
  } else {
    content += `## New Arrivals\n\n`;
    recent.forEach((p, i) => {
      content += `### ${i + 1}. ${p.name}\n\n`;
      content += `- **Brand**: ${p.brand}\n`;
      content += `- **Price**: ${p.price}\n`;
      content += `- **Released**: ${p.released}\n`;
      content += `- **Segment**: ${p.priceRange}\n\n`;
      content += `View [${p.name} full specs](/phones/${p.slug}).\n\n`;
    });
  }

  content += `Stay updated with the latest phone launches on [GadgetPriceBD](/).\n`;

  return {
    type: "blog",
    title,
    slug,
    content,
    excerpt: `The latest smartphones that have launched in Bangladesh with prices and key specifications.`,
    category: "News",
    tags: ["new phones", "latest", "bangladesh", new Date().getFullYear().toString()],
  };
}

/* ── Available templates ─────────────────────────────────────────────────── */

const TEMPLATES = [
  { id: "budget-3000",    label: "Best Phones Under ৳3,000" },
  { id: "budget-5000",    label: "Best Phones Under ৳5,000" },
  { id: "budget-10000",   label: "Best Phones Under ৳10,000" },
  { id: "budget-15000",   label: "Best Phones Under ৳15,000" },
  { id: "budget-20000",   label: "Best Phones Under ৳20,000" },
  { id: "budget-30000",   label: "Best Phones Under ৳30,000" },
  { id: "budget-50000",   label: "Best Phones Under ৳50,000" },
  { id: "brand-samsung",  label: "All Samsung Phones Roundup" },
  { id: "brand-xiaomi",   label: "All Xiaomi Phones Roundup" },
  { id: "brand-oppo",     label: "All Oppo Phones Roundup" },
  { id: "brand-realme",   label: "All Realme Phones Roundup" },
  { id: "brand-vivo",     label: "All Vivo Phones Roundup" },
  { id: "brand-apple",    label: "All Apple Phones Roundup" },
  { id: "brand-oneplus",  label: "All OnePlus Phones Roundup" },
  { id: "brand-nokia",    label: "All Nokia Phones Roundup" },
  { id: "comparison",     label: "Samsung vs Xiaomi Comparison" },
  { id: "new-arrivals",   label: "Latest Phone Arrivals" },
];

/* ── GET: list templates ────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ templates: TEMPLATES });
}

/* ── POST: generate content from a template ─────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { template: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { template } = body;
  if (!template) {
    return NextResponse.json({ error: "template is required" }, { status: 400 });
  }

  const phones = getAllPhoneSummaries();
  let generated: GeneratedContent;

  if (template.startsWith("budget-")) {
    const maxPrice = parseInt(template.replace("budget-", ""), 10);
    const label = `Under ৳${maxPrice.toLocaleString("en-IN")}`;
    generated = generateBudgetRoundup(label, maxPrice, phones);
  } else if (template.startsWith("brand-")) {
    const brand = template.replace("brand-", "");
    generated = generateBrandRoundup(brand, phones);
  } else if (template === "comparison") {
    generated = generateComparisonPost(phones);
  } else if (template === "new-arrivals") {
    generated = generateNewArrivalsPost(phones);
  } else {
    return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 });
  }

  return NextResponse.json({ generated });
}
