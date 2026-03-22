import Link from "next/link";
import { connectDB, isDBConfigured } from "@/lib/mongodb";
import { PhoneModel } from "@/lib/models/Phone";
import { getAllPhoneSlugs } from "@/lib/phones";

export default async function AdminDashboard() {
  const dbConfigured = isDBConfigured();
  let dbConnected    = false;
  let apiPhoneCount  = 0;

  if (dbConfigured) {
    try {
      const db = await connectDB();
      if (db) {
        dbConnected   = true;
        apiPhoneCount = await PhoneModel.countDocuments();
      }
    } catch { /* ignore */ }
  }

  const mdPhoneCount = getAllPhoneSlugs().length;

  const statColorClass: Record<string, string> = {
    blue:   "text-blue-600",
    green:  "text-green-600",
    purple: "text-purple-600",
  };

  const stats = [
    { label: "API Phones (MongoDB)", value: apiPhoneCount, color: "blue" },
    { label: "Archive Phones (MD)",  value: mdPhoneCount,  color: "green" },
    { label: "Total Phones",          value: apiPhoneCount + mdPhoneCount, color: "purple" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">Dashboard</h1>

      {/* DB status */}
      <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        dbConnected
          ? "border-green-200 bg-green-50 text-green-700"
          : dbConfigured
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-yellow-200 bg-yellow-50 text-yellow-700"
      }`}>
        <span className="text-base">{dbConnected ? "✅" : dbConfigured ? "❌" : "⚠️"}</span>
        <span>
          {dbConnected
            ? "MongoDB connected"
            : dbConfigured
              ? "MongoDB configured but connection failed"
              : "MongoDB not configured — set MONGODB_URI to enable API phones"}
        </span>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${statColorClass[s.color] ?? "text-slate-600"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/phones/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Phone
          </Link>
          <Link
            href="/admin/phones"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage Phones
          </Link>
          <Link
            href="/phones"
            target="_blank"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ↗ View Site
          </Link>
        </div>
      </div>

      {!dbConfigured && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-slate-800">Setup MongoDB</h2>
          <p className="mb-3 text-sm text-slate-600">
            Add these variables to your <code className="rounded bg-slate-100 px-1">.env.local</code>:
          </p>
          <pre className="rounded-xl bg-slate-900 p-4 text-sm text-green-400">
{`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority&appName=Cluster0
ADMIN_EMAIL=admin@example.com
ADMIN_SECRET=your-strong-secret-here`}
          </pre>
        </div>
      )}
    </div>
  );
}
