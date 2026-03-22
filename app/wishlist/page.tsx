"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} saved phone{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
          <span className="text-5xl">🤍</span>
          <h2 className="mt-4 text-xl font-bold text-slate-700">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-slate-500">
            Browse phones and click the heart icon to save your favourites.
          </p>
          <Link
            href="/phones"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Browse Phones →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Link href={`/phones/${item.slug}`} className="shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-contain bg-slate-50 border border-slate-100"
                  unoptimized
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">{item.brand}</p>
                <Link
                  href={`/phones/${item.slug}`}
                  className="mt-0.5 block text-lg font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-base font-bold text-blue-700">{item.price}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/phones/${item.slug}`}
                  className="hidden sm:inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  View Phone
                </Link>
                <button
                  onClick={() => remove(item.slug)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
