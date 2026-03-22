"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";

const CATEGORIES = [
  { label: "Phones", href: "/phones" },
  { label: "Tablets", href: "/tablets" },
  { label: "Watches", href: "/watches" },
  { label: "Blog", href: "/blog" },
];

const BRANDS = [
  { label: "Samsung", href: "/brands/samsung" },
  { label: "Apple", href: "/brands/apple" },
  { label: "Xiaomi", href: "/brands/xiaomi" },
  { label: "Oppo", href: "/brands/oppo" },
  { label: "OnePlus", href: "/brands/oneplus" },
  { label: "Realme", href: "/brands/realme" },
  { label: "Vivo", href: "/brands/vivo" },
];

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

export default function Navbar() {
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { slugs } = useCompare();
  const { count: wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm transition-shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <span className="text-xl font-bold text-teal-700">GadgetPriceBD</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 text-sm font-medium text-gray-600 md:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`rounded-lg px-3 py-2 transition-colors hover:bg-teal-50 hover:text-teal-700 ${
                pathname.startsWith(c.href) ? "bg-teal-50 text-teal-700" : ""
              }`}
            >
              {c.label}
            </Link>
          ))}

          {/* Brands dropdown */}
          <div className="relative">
            <button
              onClick={() => setBrandsOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:bg-teal-50 hover:text-teal-700 ${
                pathname.startsWith("/brands") ? "bg-teal-50 text-teal-700" : ""
              }`}
            >
              Brands
              <svg
                className={`h-3 w-3 transition-transform ${brandsOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {brandsOpen && (
              <div
                className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                onMouseLeave={() => setBrandsOpen(false)}
              >
                {BRANDS.map((b) => (
                  <Link
                    key={b.href}
                    href={b.href}
                    onClick={() => setBrandsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {b.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Compare link with badge */}
          <Link
            href="/compare"
            className={`relative rounded-lg px-3 py-2 transition-colors hover:bg-teal-50 hover:text-teal-700 ${
              pathname.startsWith("/compare") ? "bg-teal-50 text-teal-700" : ""
            }`}
          >
            ⚖️ Compare
            {slugs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {slugs.length}
              </span>
            )}
          </Link>

          {/* Wishlist link with badge */}
          <Link
            href="/wishlist"
            className={`relative rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-red-500 ${
              pathname.startsWith("/wishlist") ? "bg-red-50 text-red-500" : ""
            }`}
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <HeartIcon
              filled={wishlistCount > 0}
              className={`h-5 w-5 ${wishlistCount > 0 ? "text-red-500" : "text-slate-500"}`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile: hamburger + wishlist/compare icons */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/wishlist" className="relative p-2 text-gray-500 hover:text-red-500" aria-label={`Wishlist (${wishlistCount} items)`}>
            <HeartIcon
              filled={wishlistCount > 0}
              className={`h-5 w-5 ${wishlistCount > 0 ? "text-red-500" : ""}`}
            />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <nav className="mt-2 flex flex-col gap-1 text-sm font-medium text-gray-600">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 transition-colors hover:bg-teal-50 hover:text-teal-700 ${
                  pathname.startsWith(c.href) ? "bg-teal-50 text-teal-700" : ""
                }`}
              >
                {c.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-gray-100 pt-1">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Brands</p>
              {BRANDS.map((b) => (
                <Link
                  key={b.href}
                  href={b.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                >
                  {b.label}
                </Link>
              ))}
            </div>
            <div className="mt-1 border-t border-gray-100 pt-1">
              <Link
                href="/compare"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              >
                ⚖️ Compare
                {slugs.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                    {slugs.length}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
