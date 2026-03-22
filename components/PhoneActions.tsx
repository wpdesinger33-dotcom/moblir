"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import WishlistButton from "./WishlistButton";
import CompareButton from "./CompareButton";

interface Props {
  slug: string;
  name: string;
  image: string;
  price: string;
  brand: string;
}

export default function PhoneActions({ slug, name, image, price, brand }: Props) {
  const { isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(slug);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CompareButton slug={slug} name={name} />
      <WishlistButton slug={slug} name={name} image={image} price={price} brand={brand} />
      {wishlisted && (
        <span className="text-xs text-red-500 font-medium">Saved to wishlist</span>
      )}
    </div>
  );
}
