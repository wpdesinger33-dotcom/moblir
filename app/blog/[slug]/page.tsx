import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPost, getAllBlogSlugs, getAllBlogPosts } from "@/lib/blog";
import { buildBreadcrumbJsonLd } from "@/lib/seo-helpers";

const SITE = "https://gadgetpricebd.vercel.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.tags, "blog", "mobile", "bangladesh"],
    openGraph: {
      title: `${post.title} | GadgetPriceBD Blog`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: { canonical: `${SITE}/blog/${slug}` },
  };
}

const CATEGORY_COLORS: Record<string, { badge: string; hero: string }> = {
  "Buying Guide": { badge: "bg-violet-100 text-violet-700", hero: "bg-violet-500/20 text-violet-300" },
  "Comparison":   { badge: "bg-amber-100 text-amber-700",   hero: "bg-amber-500/20 text-amber-300"   },
  "Technology":   { badge: "bg-blue-100 text-blue-700",     hero: "bg-blue-500/20 text-blue-300"     },
  "Review":       { badge: "bg-emerald-100 text-emerald-700", hero: "bg-emerald-500/20 text-emerald-300" },
  "News":         { badge: "bg-rose-100 text-rose-700",     hero: "bg-rose-500/20 text-rose-300"     },
};
function catColors(cat: string) {
  return CATEGORY_COLORS[cat] ?? { badge: "bg-teal-100 text-teal-700", hero: "bg-teal-500/20 text-teal-300" };
}

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return d; }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getBlogPost(slug), getAllBlogPosts()]);
  if (!post) notFound();

  const colors = catColors(post.category);

  // Related posts: same category, excluding current post
  const related = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home",  url: SITE },
    { name: "Blog",  url: `${SITE}/blog` },
    { name: post.title, url: `${SITE}/blog/${slug}` },
  ]);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "GadgetPriceBD", url: SITE },
  };

  return (
    <div className="page-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="transition-colors hover:text-teal-600">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/blog" className="transition-colors hover:text-teal-600">Blog</Link>
        <span className="text-gray-300">/</span>
        <span className="max-w-xs truncate text-gray-700">{post.title}</span>
      </nav>

      {/* ── Article hero ──────────────────────────────────────────────── */}
      <header className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 p-8 shadow-xl sm:p-12">
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative max-w-3xl">
          {/* badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${colors.hero}`}>
              {post.category}
            </span>
            {post.source === "api" && (
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-300">New</span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-300">
            {post.excerpt}
          </p>

          {/* meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
                {post.author.charAt(0)}
              </span>
              <span className="font-medium text-gray-200">{post.author}</span>
            </div>
            <span className="hidden text-gray-600 sm:block">|</span>
            <time dateTime={post.date} className="text-gray-400">{formatDate(post.date)}</time>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {post.readingTime} min read
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Article body */}
        <article
          className="prose prose-gray max-w-none rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 prose-headings:text-gray-900 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-teal-700"
          >
            ← All Articles
          </Link>
          <Link
            href="/phones"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Browse Phones
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
                >
                  <div className="mb-3 h-0.5 w-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-400" />
                  <p className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-teal-700">
                    {rp.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">{rp.excerpt}</p>
                  <p className="mt-2 text-xs font-semibold text-teal-600">Read →</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
