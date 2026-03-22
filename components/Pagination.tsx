"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  page: number;
  pages: number;
  total: number;
}

export default function Pagination({ page, pages, total }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  if (pages <= 1) return null;

  function goTo(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`?${next.toString()}`);
  }

  const pageNums: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
      pageNums.push(i);
    } else if (pageNums[pageNums.length - 1] !== "…") {
      pageNums.push("…");
    }
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <p className="text-xs text-slate-500">{total} phones total</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev
        </button>

        {pageNums.map((n, i) =>
          n === "…" ? (
            <span key={`e${i}`} className="px-2 text-slate-400">…</span>
          ) : (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                n === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {n}
            </button>
          )
        )}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= pages}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
