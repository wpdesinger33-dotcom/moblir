"use client";

import { useCompare } from "@/contexts/CompareContext";
import { useRouter } from "next/navigation";

export default function CompareBar() {
  const { slugs, clear } = useCompare();
  const router = useRouter();

  if (slugs.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            Compare ({slugs.length}/4):
          </span>
          <div className="flex flex-wrap gap-2">
            {slugs.map((s) => (
              <span
                key={s}
                className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700"
              >
                {s.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {slugs.length >= 2 && (
            <button
              onClick={() => router.push(`/compare?slugs=${slugs.join(",")}`)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Compare Now →
            </button>
          )}
          <button
            onClick={clear}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
