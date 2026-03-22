"use client";

import { useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  label: string;
}

interface GeneratedContent {
  type: "blog" | "phone";
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
}

const TEMPLATES: Template[] = [
  { id: "budget-3000",   label: "Best Phones Under ৳3,000" },
  { id: "budget-5000",   label: "Best Phones Under ৳5,000" },
  { id: "budget-10000",  label: "Best Phones Under ৳10,000" },
  { id: "budget-15000",  label: "Best Phones Under ৳15,000" },
  { id: "budget-20000",  label: "Best Phones Under ৳20,000" },
  { id: "budget-30000",  label: "Best Phones Under ৳30,000" },
  { id: "budget-50000",  label: "Best Phones Under ৳50,000" },
  { id: "brand-samsung", label: "All Samsung Phones Roundup" },
  { id: "brand-xiaomi",  label: "All Xiaomi Phones Roundup" },
  { id: "brand-oppo",    label: "All Oppo Phones Roundup" },
  { id: "brand-realme",  label: "All Realme Phones Roundup" },
  { id: "brand-vivo",    label: "All Vivo Phones Roundup" },
  { id: "brand-apple",   label: "All Apple Phones Roundup" },
  { id: "brand-oneplus", label: "All OnePlus Phones Roundup" },
  { id: "brand-nokia",   label: "All Nokia Phones Roundup" },
  { id: "comparison",    label: "Samsung vs Xiaomi Comparison" },
  { id: "new-arrivals",  label: "Latest Phone Arrivals" },
];

export default function ContentGeneratorPage() {
  const [selected, setSelected] = useState("");
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  async function handleGenerate() {
    if (!selected) return;
    setLoading(true);
    setMessage("");
    setGenerated(null);
    setPreviewHtml("");

    try {
      const res = await fetch("/api/v1/content-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setGenerated(data.generated);

      // Generate a simple HTML preview from markdown content
      const html = simpleMarkdownToHtml(data.generated.content);
      setPreviewHtml(html);
    } catch (err) {
      setMessage(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToApi() {
    if (!generated) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/v1/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generated.title,
          slug: generated.slug,
          content: generated.content,
          excerpt: generated.excerpt,
          category: generated.category,
          tags: generated.tags,
          date: new Date().toISOString().split("T")[0],
          published: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`API Error: ${data.error}`);
      } else {
        setMessage(`Saved to API (MongoDB) successfully! View: /blog/${generated.slug}`);
      }
    } catch (err) {
      setMessage(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadMd() {
    if (!generated) return;
    const frontmatter = [
      "---",
      `title: "${generated.title}"`,
      `date: "${new Date().toISOString().split("T")[0]}"`,
      `author: "GadgetPriceBD Team"`,
      `category: "${generated.category}"`,
      `tags: [${generated.tags.map((t) => `"${t}"`).join(", ")}]`,
      `excerpt: "${generated.excerpt}"`,
      "---",
      "",
    ].join("\n");

    const md = frontmatter + generated.content;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generated.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(`Downloaded ${generated.slug}.md — add to /blog/ folder and redeploy.`);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-teal-600">Admin</Link>
        <span>/</span>
        <span className="text-gray-700">Content Generator</span>
      </nav>

      <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
        Content Generator
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Auto-generate blog posts from existing phone data on the website. Select
        a template, preview the content, then save to API (MongoDB) or download
        as a Markdown file.
      </p>

      {/* Template selection */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
          1. Choose Template
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                selected === t.id
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-teal-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selected || loading}
          className="mt-4 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 rounded-lg p-3 text-sm font-medium ${
          message.startsWith("Error") || message.startsWith("Failed") || message.startsWith("API Error")
            ? "bg-red-50 text-red-700"
            : "bg-green-50 text-green-700"
        }`}>
          {message}
        </div>
      )}

      {/* Generated content */}
      {generated && (
        <>
          {/* Metadata */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              2. Generated Metadata
            </h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-500">Title</dt>
                <dd className="text-gray-900">{generated.title}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Slug</dt>
                <dd className="font-mono text-gray-900">{generated.slug}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Category</dt>
                <dd className="text-gray-900">{generated.category}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Tags</dt>
                <dd className="text-gray-900">{generated.tags.join(", ")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-500">Excerpt</dt>
                <dd className="text-gray-900">{generated.excerpt}</dd>
              </div>
            </dl>
          </div>

          {/* Preview */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                3. Preview
              </h2>
            </div>
            <div
              className="prose prose-sm max-w-none p-5 prose-headings:text-gray-900 prose-a:text-teal-600"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {/* Raw markdown */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Raw Markdown
              </h2>
            </div>
            <pre className="max-h-64 overflow-auto p-5 text-xs text-gray-700">
              {generated.content}
            </pre>
          </div>

          {/* Save actions */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              4. Save
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveToApi}
                disabled={saving}
                className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save to API (MongoDB)"}
              </button>
              <button
                onClick={handleDownloadMd}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Download as .md File
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              API saves to MongoDB (works on Vercel). MD download creates a file
              you can add to the <code>/blog/</code> folder and redeploy.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/** Simple markdown-to-HTML converter for preview (no external deps in client). */
function simpleMarkdownToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // List items
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Paragraphs
    .replace(/\n\n/g, "</p><p>")
    // Line breaks
    .replace(/\n/g, "<br>");

  // Wrap in paragraph
  html = `<p>${html}</p>`;

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>(?:<br>)?)+/g, (match) => {
    return `<ul>${match.replace(/<br>/g, "")}</ul>`;
  });

  return html;
}
