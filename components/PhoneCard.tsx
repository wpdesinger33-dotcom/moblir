import Link from "next/link";
import Image from "next/image";
import type { DeviceSummary } from "@/lib/types";
import { priceRangeClass } from "@/lib/price";
import CompareButton from "./CompareButton";
import WishlistButton from "./WishlistButton";

interface Props {
  phone: DeviceSummary;
}

export default function PhoneCard({ phone }: Props) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <Link href={`/phones/${phone.slug}`} className="block">
        <div className="relative h-52 w-full bg-gray-50 flex items-center justify-center overflow-hidden">
          <Image
            src={phone.image}
            alt={`${phone.name} - ${phone.brand} phone price in Bangladesh`}
            width={200}
            height={200}
            className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            unoptimized
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priceRangeClass(phone.priceRange)}`}>
              {phone.priceRange}
            </span>
            {phone.category === "feature-phone" && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">Button Phone</span>
            )}
            {phone.source === "api" && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">New</span>
            )}
            {phone.featured && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">★ Featured</span>
            )}
          </div>
          {/* Wishlist button top-right */}
          <div className="absolute top-2 right-2">
            <WishlistButton
              slug={phone.slug}
              name={phone.name}
              image={phone.image}
              price={phone.price}
              brand={phone.brand}
            />
          </div>
        </div>

        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-600">{phone.brand}</p>
          <h2 className="mt-1 text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
            {phone.name}
          </h2>
          <p className="mt-2 text-lg font-bold text-teal-700">{phone.price}</p>
          {phone.tags && phone.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {phone.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Compare button sits outside the Link */}
      <div className="px-4 pb-4 pt-2">
        <CompareButton slug={phone.slug} name={phone.name} />
      </div>
    </div>
  );
}
