"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef } from "react";

const BRANDS = ["All", "Samsung", "Apple", "Xiaomi", "Oppo", "Vivo", "Realme", "OnePlus"];
const SORT_OPTIONS = [
  { value: "name",       label: "Name A–Z" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest",     label: "Newest First" },
];

const MAX_PRICE = 200_000;
const STEP      = 1_000;

function formatBDT(val: number) {
  if (val <= 0)           return "৳0";
  if (val >= 100_000)     return `৳${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000)       return `৳${(val / 1_000).toFixed(0)}k`;
  return `৳${val}`;
}

export default function SearchFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const currentBrand = params.get("brand") ?? "all";
  const currentQ     = params.get("q")     ?? "";
  const currentSort  = params.get("sort")  ?? "name";

  /* ── price slider local state (debounced to URL) ─────────────────────── */
  const initMin = parseInt(params.get("minPrice") ?? "0", 10);
  const initMax = parseInt(params.get("maxPrice") ?? String(MAX_PRICE), 10);
  const [priceMin, setPriceMin] = useState(initMin);
  const [priceMax, setPriceMax] = useState(initMax);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── generic URL param update ─────────────────────────────────────────── */
  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== "all" && value !== "") {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      router.push(`?${next.toString()}`);
    },
    [params, router],
  );

  /* ── price slider change (debounced URL push) ────────────────────────── */
  const handlePrice = useCallback(
    (newMin: number, newMax: number) => {
      setPriceMin(newMin);
      setPriceMax(newMax);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const next = new URLSearchParams(params.toString());
        if (newMin > 0) {
          next.set("minPrice", String(newMin));
        } else {
          next.delete("minPrice");
        }
        if (newMax < MAX_PRICE) {
          next.set("maxPrice", String(newMax));
        } else {
          next.delete("maxPrice");
        }
        next.delete("page");
        router.push(`?${next.toString()}`);
      }, 400);
    },
    [params, router],
  );

  const resetPrice = () => handlePrice(0, MAX_PRICE);
  const isPriceFiltered = priceMin > 0 || priceMax < MAX_PRICE;

  /* track fill % */
  const leftPct  = (priceMin / MAX_PRICE) * 100;
  const rightPct = 100 - (priceMax / MAX_PRICE) * 100;

  return (
    <div className="space-y-4">

      {/* ── Row 1: search + sort ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          type="text"
          placeholder="Search phones…"
          defaultValue={currentQ}
          onChange={(e) => update("q", e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 sm:w-64"
        />
        <select
          value={currentSort}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Row 2: price slider ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        {/* header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Price Range
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-700">
              {formatBDT(priceMin)} — {priceMax >= MAX_PRICE ? "৳2L+" : formatBDT(priceMax)}
            </span>
            {isPriceFiltered && (
              <button
                onClick={resetPrice}
                className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* dual-range track */}
        <div className="relative h-8 select-none">
          {/* background track */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
          {/* active fill */}
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-teal-500"
            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
          />

          {/* min handle */}
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={STEP}
            value={priceMin}
            onChange={(e) => {
              const v = Math.min(parseInt(e.target.value, 10), priceMax - STEP);
              handlePrice(v, priceMax);
            }}
            className="
              pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:shadow-md
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:bg-teal-600 [&::-moz-range-thumb]:shadow-md
            "
          />

          {/* max handle */}
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={STEP}
            value={priceMax}
            onChange={(e) => {
              const v = Math.max(parseInt(e.target.value, 10), priceMin + STEP);
              handlePrice(priceMin, v);
            }}
            className="
              pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:shadow-md
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:bg-teal-600 [&::-moz-range-thumb]:shadow-md
            "
          />
        </div>

        {/* tick labels */}
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>৳0</span>
          <span>৳50k</span>
          <span>৳1L</span>
          <span>৳1.5L</span>
          <span>৳2L+</span>
        </div>
      </div>

      {/* ── Row 3: brand pills ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {BRANDS.map((b) => {
          const val    = b.toLowerCase();
          const active = currentBrand === val || (b === "All" && currentBrand === "all");
          return (
            <button
              key={b}
              onClick={() => update("brand", val)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "bg-teal-600 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700"
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>
    </div>
  );
}
