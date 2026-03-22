import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { PhoneModel } from "@/lib/models/Phone";
import AdminPhoneActions from "./AdminPhoneActions";

export default async function AdminPhonesPage() {
  let phones: { _id: string; name: string; slug: string; brand: string; price: string; source: string; featured: boolean; createdAt: string }[] = [];
  let dbConnected = false;

  try {
    const db = await connectDB();
    if (db) {
      dbConnected = true;
      const raw = await PhoneModel.find({})
        .sort({ featured: -1, createdAt: -1 })
        .select("name slug brand price source featured createdAt")
        .lean();
      phones = raw.map((p) => ({
        _id:       String(p._id),
        name:      p.name,
        slug:      p.slug,
        brand:     p.brand,
        price:     p.price,
        source:    p.source ?? "api",
        featured:  p.featured ?? false,
        createdAt: new Date(p.createdAt).toLocaleDateString(),
      }));
    }
  } catch { /* ignore */ }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Phones <span className="ml-2 text-lg font-normal text-slate-500">({phones.length})</span>
        </h1>
        <Link
          href="/admin/phones/new"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Phone
        </Link>
      </div>

      {!dbConnected ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-700">
          MongoDB not connected. Set <code>MONGODB_URI</code> in <code>.env.local</code> to manage API phones.
        </div>
      ) : phones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No API phones yet.{" "}
          <Link href="/admin/phones/new" className="text-blue-600 underline">
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {["Name", "Brand", "Price", "Featured", "Added", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {phones.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{p.brand}</td>
                  <td className="px-4 py-3 text-slate-600">{p.price}</td>
                  <td className="px-4 py-3">
                    {p.featured ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">★ Featured</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/phones/${p._id}/edit`}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>
                      <AdminPhoneActions slug={p.slug} id={p._id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
