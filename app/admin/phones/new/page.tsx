import type { Metadata } from "next";
import PhoneForm from "../PhoneForm";

export const metadata: Metadata = { title: "Add Phone – Admin" };

export default function NewPhonePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">Add New Phone</h1>
      <PhoneForm mode="create" />
    </div>
  );
}
