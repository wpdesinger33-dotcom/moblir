"use client";

import { useCompare } from "@/contexts/CompareContext";

export default function CompareButton({ slug, name }: { slug: string; name: string }) {
  const { toggle, isSelected, isFull } = useCompare();
  const selected = isSelected(slug);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }}
      title={selected ? `Remove "${name}" from compare` : isFull ? "Compare list is full (max 4)" : `Add "${name}" to compare`}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
        selected
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : isFull
            ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700"
      }`}
      disabled={isFull && !selected}
    >
      {selected ? "✓ Comparing" : "+ Compare"}
    </button>
  );
}
