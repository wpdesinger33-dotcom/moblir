import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

const SITE = "https://gadgetpricebd.vercel.app";

export const metadata: Metadata = {
  title: "Blog – Mobile Tips, Reviews & Buying Guides",
  description:
    "Read the latest articles on smartphone buying guides, brand comparisons, technology trends, and mobile phone tips in Bangladesh.",
  alternates: { canonical: `${SITE}/blog` },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Buying Guide": "bg-violet-100 text-violet-700",
  "Comparison":   "bg-amber-100 text-amber-700",
  "Technology":   "bg-blue-100 text-blue-700",
  "Review":       "bg-emerald-100 text-emerald-700",
  "News":         "bg-rose-100 text-rose-700",
  "Tips":         "bg-orange-100 text-orange-700",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-teal-100 text-teal-700";
}

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}

/* ── Featured hero card (first / latest post) ─────────────────────────── */
function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 p-8 shadow-xl transition-all hover:shadow-2xl sm:p-10"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative">
        {/* badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-300">
            {post.category}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
            Featured
          </span>
          {post.source === "api" && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-300">New</span>
          )}
        </div>

        <h2 className="text-2xl font-extrabold leading-snug text-white transition-colors group-hover:text-teal-300 sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-300 sm:text-base">
          {post.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
              {post.author.charAt(0)}
            </span>
            <span className="font-medium text-gray-200">{post.author}</span>
          </div>
          <span className="text-gray-600">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="text-gray-600">·</span>
          <span>{post.readingTime} min read</span>
        </div>

        <div className="mt-5 inline-flex items-center gap-1 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow transition-colors group-hover:bg-teal-400">
          Read Article →
        </div>
      </div>
    </Link>
  );
}

/* ── Regular post card ────────────────────────────────────────────────── */
function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
    >
      {/* top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-indigo-400" />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${categoryColor(post.category)}`}>
            {post.category}
          </span>
          {post.source === "api" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">New</span>
          )}
        </div>

        <h2 className="flex-1 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-teal-700 sm:text-lg">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
              {post.author.charAt(0)}
            </span>
            <span className="font-medium text-gray-600">{post.author.split(" ")[0]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default async function BlogListingPage() {
  const posts = await getAllBlogPosts();
  const [featured, ...rest] = posts;

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  return (
    <div className="page-fade-in space-y-10">

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
          GadgetPriceBD Blog
        </span>
        <h1 className="mt-3 text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Latest Articles
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-500">
          Smartphone tips, buying guides, brand comparisons &amp; technology trends from
          Bangladesh&apos;s #1 mobile price guide.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
          <p className="text-4xl">📝</p>
          <p className="mt-3 text-lg font-semibold text-gray-700">No blog posts yet</p>
          <p className="mt-1 text-sm text-gray-500">Check back soon for articles!</p>
        </div>
      ) : (
        <>
          {/* ── Category pills ───────────────────────────────────────── */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* ── Featured post ─────────────────────────────────────────── */}
          {featured && <FeaturedCard post={featured} />}

          {/* ── Remaining posts grid ──────────────────────────────────── */}
          {rest.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-800">More Articles</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 p-8 text-center text-white shadow-lg">
        <h2 className="text-xl font-extrabold">Looking for a new phone?</h2>
        <p className="mt-1 text-sm text-white/80">
          Browse our full database of mobiles with prices in Bangladesh.
        </p>
        <Link
          href="/phones"
          className="mt-4 inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-teal-700 shadow hover:bg-gray-50 transition-colors"
        >
          Browse Phones →
        </Link>
      </div>
    </div>
  );
}
