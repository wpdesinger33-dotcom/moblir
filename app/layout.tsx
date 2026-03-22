import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CompareBar from "@/components/CompareBar";
import FloatingWishlist from "@/components/FloatingWishlist";
import { CompareProvider } from "@/contexts/CompareContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "GadgetPriceBD – Mobile Phone Price in Bangladesh 2025",
    template: "%s | GadgetPriceBD",
  },
  description:
    "Find the latest mobile phone prices, full specifications, and reviews in Bangladesh. Compare Samsung, Apple, Xiaomi, Oppo, Vivo, Realme, OnePlus and more smartphones at the best price in BD.",
  keywords: [
    "mobile price in bangladesh",
    "mobile phone price in bangladesh",
    "smartphone price bd",
    "samsung phone price in bangladesh",
    "xiaomi phone price in bangladesh",
    "oppo phone price bd",
    "realme phone price bangladesh",
    "iphone price in bangladesh",
    "mobile phone specifications",
    "phone review bd",
    "gadget price bd",
    "budget smartphone bangladesh",
    "5g phone price in bd",
    "best phone under 15000 in bangladesh",
    "phone comparison bangladesh",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GadgetPriceBD",
    title: "GadgetPriceBD – Mobile Phone Price in Bangladesh 2025",
    description:
      "Find the latest mobile phone prices, full specifications, and reviews in Bangladesh. Compare Samsung, Apple, Xiaomi, Oppo, Vivo, Realme and more.",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "GadgetPriceBD – Mobile Phone Price in Bangladesh",
    description: "Latest mobile phone prices, specs and reviews in Bangladesh.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GadgetPriceBD",
    url: SITE,
    description: "Bangladesh's trusted source for mobile phone prices, specifications and reviews.",
    sameAs: [],
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f0f4f8] text-gray-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <CompareProvider>
          <WishlistProvider>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 pb-24">{children}</main>
            <CompareBar />
            <FloatingWishlist />
          </WishlistProvider>
        </CompareProvider>
        <footer className="border-t border-gray-200 bg-gray-900 py-8 text-center text-sm text-gray-400">
          <div className="mx-auto max-w-7xl px-4">
            <p className="font-semibold text-white">📱 GadgetPriceBD</p>
            <p className="mt-1">Mobile phone prices, specifications &amp; reviews in Bangladesh.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <Link href="/phones" className="hover:text-teal-400 transition-colors">Phones</Link>
              <Link href="/tablets" className="hover:text-teal-400 transition-colors">Tablets</Link>
              <Link href="/watches" className="hover:text-teal-400 transition-colors">Watches</Link>
              <Link href="/compare" className="hover:text-teal-400 transition-colors">Compare</Link>
              <Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link>
              <a href="/sitemap.xml" className="hover:text-teal-400 transition-colors">Sitemap</a>
            </div>
            <p className="mt-3 text-xs text-gray-600">
              © {new Date().getFullYear()} GadgetPriceBD. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
