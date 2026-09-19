import { RfqForm } from "@/components/forms/RfqForm";

export default function NewRfqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">Create RFQ</h1>
      <p className="mt-2 text-sm text-slate-600">
        Describe what you need and when you need it delivered.
      </p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <RfqForm mode="create" />
      </div>
    </div>
  );
}
