"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/contexts/WishlistContext";

export default function FloatingWishlist() {
  const { items, remove, count } = useWishlist();
  const [open, setOpen] = useState(false);

  if (count === 0 && !open) return null;

  return (
    <>
      {/* Floating heart button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Wishlist (${count} items)`}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 text-red-500"
        >
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {/* Wishlist modal */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed bottom-20 right-4 z-50 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-modal-title"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 id="wishlist-modal-title" className="font-bold text-slate-800">
                ❤️ Wishlist ({count})
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                <p className="text-sm">Your wishlist is empty.</p>
                <Link
                  href="/phones"
                  className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Browse phones →
                </Link>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-3 px-4 py-3">
                      <Link href={`/phones/${item.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-lg object-contain bg-slate-50 border border-slate-100"
                          unoptimized
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/phones/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="block text-sm font-semibold text-slate-800 hover:text-blue-700 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs font-bold text-blue-600">{item.price}</p>
                      </div>
                      <button
                        onClick={() => remove(item.slug)}
                        className="shrink-0 rounded-lg p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 px-4 py-3">
                  <Link
                    href="/wishlist"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    View Full Wishlist →
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
