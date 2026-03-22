"use client";

import { useWishlist } from "@/contexts/WishlistContext";

interface Props {
  slug: string;
  name: string;
  image: string;
  price: string;
  brand: string;
}

export default function WishlistButton({ slug, name, image, price, brand }: Props) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(slug);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ slug, name, image, price, brand });
      }}
      title={wishlisted ? `Remove "${name}" from wishlist` : `Add "${name}" to wishlist`}
      aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`group/heart flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${
        wishlisted
          ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-400 hover:border-red-300 hover:text-red-400"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={wishlisted ? 0 : 1.5}
        className={`h-4 w-4 transition-transform duration-200 ${wishlisted ? "scale-110" : "group-hover/heart:scale-110"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
