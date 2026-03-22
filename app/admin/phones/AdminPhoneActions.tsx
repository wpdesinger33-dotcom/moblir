"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPhoneActions({ slug, id }: { slug: string; id: string }) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete phone "${slug}"?`)) return;
    setBusy(true);
    try {
      // Cookie auth is sent automatically; the DELETE route checks it server-side
      const res = await fetch(`/api/v1/phones/${slug}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Delete failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      data-id={id}
      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
