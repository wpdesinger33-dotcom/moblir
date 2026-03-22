/**
 * Blog data layer – merges markdown files from /blog with MongoDB posts.
 * Markdown posts are baked into the repo (static). API posts are created
 * at runtime via the admin dashboard and stored in MongoDB (works on Vercel
 * where the filesystem is read-only).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import { connectDB } from "./mongodb";
import { BlogPostModel } from "./models/BlogPost";

const BLOG_DIR = path.join(process.cwd(), "blog");

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  readingTime: number;
  source: "md" | "api";
}

export interface BlogPostDetail extends BlogPost {
  contentHtml: string;
}

/** Estimate reading time in minutes from word count. */
function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* ── Markdown helpers ─────────────────────────────────────────────────── */

function getMdPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const fp = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(fp, "utf8");
      const { data, content } = matter(raw);
      const slug = filename.replace(/\.md$/, "");

      const excerpt =
        (data.excerpt as string) ??
        content
          .split("\n")
          .find((l) => l.trim().length > 0 && !l.trim().startsWith("#"))
          ?.slice(0, 200) ??
        "";

      return {
        slug,
        title: (data.title as string) ?? slug,
        excerpt,
        date: (data.date as string) ?? "",
        author: (data.author as string) ?? "GadgetPriceBD Team",
        category: (data.category as string) ?? "General",
        tags: (data.tags as string[]) ?? [],
        image: (data.image as string) ?? "",
        readingTime: estimateReadingTime(content),
        source: "md" as const,
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

async function getMdPostDetail(slug: string): Promise<BlogPostDetail | null> {
  const fp = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) return null;

  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);

  const processed = await remark().use(remarkGfm).use(html).process(content);
  const contentHtml = processed.toString();

  const excerpt =
    (data.excerpt as string) ??
    content
      .split("\n")
      .find((l) => l.trim().length > 0 && !l.trim().startsWith("#"))
      ?.slice(0, 200) ??
    "";

  return {
    slug,
    title: (data.title as string) ?? slug,
    excerpt,
    date: (data.date as string) ?? "",
    author: (data.author as string) ?? "GadgetPriceBD Team",
    category: (data.category as string) ?? "General",
    tags: (data.tags as string[]) ?? [],
    image: (data.image as string) ?? "",
    readingTime: estimateReadingTime(content),
    contentHtml,
    source: "md" as const,
  };
}

/* ── Merged helpers (MD + MongoDB) ────────────────────────────────────── */

/** Get all blog posts merged from MongoDB + MD, sorted by date descending. */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const mdPosts = getMdPosts();

  let apiPosts: BlogPost[] = [];
  try {
    const db = await connectDB();
    if (db) {
      const raw = await BlogPostModel.find({ published: true })
        .sort({ date: -1 })
        .lean();
      apiPosts = raw.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        date: p.date,
        author: p.author,
        category: p.category,
        tags: p.tags,
        image: p.image,
        readingTime: estimateReadingTime(p.content),
        source: "api" as const,
      }));
    }
  } catch {
    /* DB unavailable – fall through to MD-only */
  }

  // Merge: API posts first, then MD posts not overridden by API
  const apiSlugs = new Set(apiPosts.map((p) => p.slug));
  const merged = [
    ...apiPosts,
    ...mdPosts.filter((p) => !apiSlugs.has(p.slug)),
  ];

  // Sort by date descending
  merged.sort((a, b) => (b.date > a.date ? 1 : -1));

  return merged;
}

/** Get all blog slugs for static generation / sitemap. */
export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((p) => p.slug);
}

/** Get a single blog post by slug: try DB first, then MD. */
export async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  // Try MongoDB first
  try {
    const db = await connectDB();
    if (db) {
      const p = await BlogPostModel.findOne({ slug, published: true }).lean();
      if (p) {
        // Render markdown content to HTML
        const processed = await remark().use(remarkGfm).use(html).process(p.content);
        return {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          date: p.date,
          author: p.author,
          category: p.category,
          tags: p.tags,
          image: p.image,
          readingTime: estimateReadingTime(p.content),
          contentHtml: processed.toString(),
          source: "api",
        };
      }
    }
  } catch {
    /* fall through */
  }

  // Fall back to MD
  return getMdPostDetail(slug);
}

/** Get unique blog categories. */
export async function getAllBlogCategories(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return [...new Set(posts.map((p) => p.category))].sort();
}

