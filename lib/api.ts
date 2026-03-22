/**
 * Future API client for phones released in 2025 and later.
 *
 * Set NEXT_PUBLIC_API_URL in your .env.local to point at your backend.
 * Until then, all functions return empty results gracefully.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.example.com";

export interface ApiPhone {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  /** Remote image URL served by the API */
  image: string;
  released: string;
  specs: Record<string, string>;
  source: "api";
}

/**
 * Fetch all new phones (≥ 2025) from the remote API.
 * Returns [] when API_BASE_URL is not yet configured.
 */
export async function fetchNewPhones(): Promise<ApiPhone[]> {
  if (API_BASE_URL === "https://api.example.com") {
    return [];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/phones`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as ApiPhone[];
  } catch (err) {
    console.error("Failed to fetch new phones from API:", err);
    return [];
  }
}

/**
 * Fetch a single new phone by slug from the remote API.
 * Returns null when not configured or the phone is not found.
 */
export async function fetchNewPhoneBySlug(
  slug: string
): Promise<ApiPhone | null> {
  if (API_BASE_URL === "https://api.example.com") {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/phones/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as ApiPhone;
  } catch (err) {
    console.error(`Failed to fetch phone "${slug}" from API:`, err);
    return null;
  }
}
