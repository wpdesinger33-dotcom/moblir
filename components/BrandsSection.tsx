"use client";

import { useState } from "react";
import Link from "next/link";

const INITIAL_VISIBLE = 12;

interface BrandsSectionProps {
  brands: string[];
}

export default function BrandsSection({ brands }: BrandsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? brands : brands.slice(0, INITIAL_VISIBLE);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-gray-800">Brands</h2>
      <div className="flex flex-wrap gap-2">
        {visible.map((b) => (
          <Link
            key={b}
            href={`/brands/${b}`}
            className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 capitalize shadow-sm hover:border-teal-400 hover:text-teal-700 transition-colors"
          >
            {b}
          </Link>
        ))}
      </div>
      {brands.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
        >
          {expanded
            ? "Show less"
            : `Show all ${brands.length} brands →`}
        </button>
      )}
    </section>
  );
}
