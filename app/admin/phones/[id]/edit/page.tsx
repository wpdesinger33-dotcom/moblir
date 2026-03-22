import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { PhoneModel } from "@/lib/models/Phone";
import PhoneForm from "../../PhoneForm";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Edit Phone – Admin" };

export default async function EditPhonePage({ params }: PageProps) {
  const { id } = await params;

  let initial: Parameters<typeof PhoneForm>[0]["initial"] | null = null;

  try {
    const db = await connectDB();
    if (db) {
      const phone = await PhoneModel.findById(id).lean();
      if (phone) {
        initial = {
          name:        phone.name,
          slug:        phone.slug,
          brand:       phone.brand,
          price:       phone.price,
          image:       phone.image,
          released:    phone.released,
          category:    phone.category,
          tags:        (phone.tags ?? []).join(", "),
          description: phone.description,
          featured:    phone.featured ?? false,
          specs:       phone.specs ?? [],
        };
      }
    }
  } catch { /* ignore */ }

  if (!initial) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">Edit Phone</h1>
      <PhoneForm mode="edit" initial={initial} />
    </div>
  );
}
