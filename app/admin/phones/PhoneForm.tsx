"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface PhoneFormData {
  name:        string;
  slug:        string;
  brand:       string;
  price:       string;
  image:       string;
  released:    string;
  category:    string;
  tags:        string;   // comma-separated
  description: string;
  featured:    boolean;
  specs:       { label: string; value: string }[];
}

const EMPTY: PhoneFormData = {
  name: "", slug: "", brand: "", price: "", image: "",
  released: "", category: "phone", tags: "", description: "",
  featured: false, specs: [],
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Quick-add spec templates ─────────────────────────────────────────── */
const SPEC_TEMPLATES: { group: string; items: string[] }[] = [
  {
    group: "Display",
    items: ["Display Type", "Screen Size", "Resolution", "Refresh Rate", "Screen Protection"],
  },
  {
    group: "Performance",
    items: ["Chipset", "CPU", "GPU", "RAM", "Storage"],
  },
  {
    group: "Camera",
    items: ["Main Camera", "Front Camera", "Video Recording"],
  },
  {
    group: "Battery & Charging",
    items: ["Battery Capacity", "Charging Speed", "Wireless Charging"],
  },
  {
    group: "Connectivity",
    items: ["Network", "Wi-Fi", "Bluetooth", "NFC", "USB"],
  },
  {
    group: "Build",
    items: ["Dimensions", "Weight", "Colors", "OS", "OS Version"],
  },
];

/* ── Simple Markdown parser ───────────────────────────────────────────── */
function parseMdPhone(md: string): Partial<PhoneFormData> | null {
  try {
    // Extract YAML frontmatter
    const fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---/);
    const result: Partial<PhoneFormData> = {};

    if (fmMatch) {
      const fm = fmMatch[1];
      const get = (key: string) => {
        const m = fm.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?`, "m"));
        return m ? m[1].trim() : "";
      };
      if (get("name"))     result.name     = get("name");
      if (get("slug"))     result.slug     = get("slug");
      if (get("brand"))    result.brand    = get("brand");
      if (get("price"))    result.price    = get("price");
      if (get("image"))    result.image    = get("image");
      if (get("released")) result.released = get("released");
      if (get("category")) result.category = get("category");
      const tagsMatch = fm.match(/^tags:\s*\[([^\]]*)\]/m);
      if (tagsMatch) result.tags = tagsMatch[1].replace(/["']/g, "").trim();
    }

    // Extract Markdown table specs (| Label | Value |)
    const specs: { label: string; value: string }[] = [];
    const tableRows = md.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm);
    for (const row of tableRows) {
      const label = row[1].trim();
      const value = row[2].trim();
      // Skip header/separator rows
      if (label === "Feature" || label === "---" || /^[-:]+$/.test(label)) continue;
      specs.push({ label, value });
    }
    if (specs.length > 0) result.specs = specs;

    // Extract description (first paragraph after frontmatter)
    const bodyMatch = md.match(/^---[\s\S]*?---\s*\n+([\s\S]*?)(?:\n#|\n\n##|$)/);
    if (bodyMatch) {
      const desc = bodyMatch[1].trim().split("\n\n")[0].trim();
      if (desc && desc.length < 2000) result.description = desc;
    }

    return result;
  } catch {
    return null;
  }
}

export default function PhoneForm({
  initial,
  mode,
}: {
  initial?: Partial<PhoneFormData>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form,    setForm]    = useState<PhoneFormData>({ ...EMPTY, ...initial });
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [mdText,  setMdText]  = useState("");
  const [mdError, setMdError] = useState("");
  const [showMd,  setShowMd]  = useState(false);

  function setField<K extends keyof PhoneFormData>(k: K, v: PhoneFormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addSpec()  { setField("specs", [...form.specs, { label: "", value: "" }]); }
  function removeSpec(i: number) {
    setField("specs", form.specs.filter((_, idx) => idx !== i));
  }
  function updateSpec(i: number, key: "label" | "value", v: string) {
    setField("specs", form.specs.map((s, idx) => idx === i ? { ...s, [key]: v } : s));
  }

  function quickAddSpec(label: string) {
    // Don't add if already present
    if (form.specs.some((s) => s.label.toLowerCase() === label.toLowerCase())) return;
    setField("specs", [...form.specs, { label, value: "" }]);
  }

  function importFromMd() {
    setMdError("");
    if (!mdText.trim()) return;
    const parsed = parseMdPhone(mdText);
    if (!parsed) {
      setMdError("Could not parse the Markdown. Make sure it has a valid frontmatter and/or table.");
      return;
    }
    setForm((f) => ({
      ...f,
      ...(parsed.name        ? { name: parsed.name }               : {}),
      ...(parsed.slug        ? { slug: parsed.slug }               : {}),
      ...(parsed.brand       ? { brand: parsed.brand }             : {}),
      ...(parsed.price       ? { price: parsed.price }             : {}),
      ...(parsed.image       ? { image: parsed.image }             : {}),
      ...(parsed.released    ? { released: parsed.released }       : {}),
      ...(parsed.category    ? { category: parsed.category }       : {}),
      ...(parsed.tags        ? { tags: parsed.tags }               : {}),
      ...(parsed.description ? { description: parsed.description } : {}),
      ...(parsed.specs && parsed.specs.length > 0 ? { specs: parsed.specs } : {}),
    }));
    setShowMd(false);
    setMdText("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const url    = mode === "create" ? "/api/v1/phones" : `/api/v1/phones/${initial?.slug ?? form.slug}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/phones");
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error ?? "Save failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* ── Import from Markdown ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <button
          type="button"
          onClick={() => setShowMd((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 hover:text-blue-600"
        >
          <span>📋 Import from Markdown (.md file)</span>
          <span className="text-xs text-slate-400">{showMd ? "▲ hide" : "▼ expand"}</span>
        </button>

        {showMd && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-500">
              Paste the contents of a phone <code>.md</code> file. Frontmatter fields and the
              specifications table will be imported automatically.
            </p>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              rows={10}
              placeholder={"---\nname: \"Samsung Galaxy S25\"\nslug: \"samsung-galaxy-s25\"\n...\n---\n\n## Specifications\n\n| Feature | Details |\n|---|---|\n| Display | 6.2 inch AMOLED |"}
              value={mdText}
              onChange={(e) => setMdText(e.target.value)}
            />
            {mdError && (
              <p className="text-xs text-red-600">{mdError}</p>
            )}
            <button
              type="button"
              onClick={importFromMd}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Import
            </button>
          </div>
        )}
      </div>

      {/* Basic info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">Basic Info</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => {
                setField("name", e.target.value);
                if (mode === "create") setField("slug", toSlug(e.target.value));
              }}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => setField("slug", toSlug(e.target.value))}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Brand *</label>
            <input className={inputCls} value={form.brand} onChange={(e) => setField("brand", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Price *</label>
            <input className={inputCls} placeholder="৳ 99,999" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Image URL</label>
            <input className={inputCls} placeholder="https://… or /images/phones/…" value={form.image} onChange={(e) => setField("image", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Released (year)</label>
            <input className={inputCls} placeholder="2025" value={form.released} onChange={(e) => setField("released", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => setField("category", e.target.value)}>
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
              <option value="watch">Watch</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input className={inputCls} placeholder="5G, 50MP Camera, AI" value={form.tags} onChange={(e) => setField("tags", e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Description</label>
          <textarea
            className={`${inputCls} min-h-24 resize-y`}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setField("featured", e.target.checked)}
            className="rounded"
          />
          Featured (shown first in listings)
        </label>
      </div>

      {/* Specs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Specifications</h2>
          <button type="button" onClick={addSpec} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">
            + Add Row
          </button>
        </div>

        {/* Quick-add spec buttons */}
        <div className="mb-4 space-y-2">
          {SPEC_TEMPLATES.map((group) => (
            <div key={group.group} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-slate-500 w-24 shrink-0">{group.group}</span>
              {group.items.map((item) => {
                const exists = form.specs.some((s) => s.label.toLowerCase() === item.toLowerCase());
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => quickAddSpec(item)}
                    disabled={exists}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      exists
                        ? "border-green-300 bg-green-50 text-green-700 cursor-default"
                        : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {exists ? "✓ " : "+ "}{item}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {form.specs.length === 0 && (
          <p className="text-sm text-slate-400">No specs yet. Use the quick-add buttons above or click &ldquo;Add Row&rdquo;.</p>
        )}

        <div className="space-y-2">
          {form.specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                placeholder="Feature (e.g. Display)"
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
              />
              <input
                className="flex-[2] rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                placeholder="Details"
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
              />
              <button type="button" onClick={() => removeSpec(i)} className="shrink-0 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Phone" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
