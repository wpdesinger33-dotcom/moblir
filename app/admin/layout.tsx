import type { Metadata } from "next";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = { title: "Admin – GadgetPriceBD" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-700">GadgetPriceBD</span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Admin</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <a href="/admin" className="hover:text-blue-700">Dashboard</a>
            <a href="/admin/phones" className="hover:text-blue-700">Phones</a>
            <a href="/" target="_blank" className="hover:text-blue-700">↗ Site</a>
            <LogoutButton />
          </nav>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
