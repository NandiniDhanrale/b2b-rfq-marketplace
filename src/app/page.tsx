import Link from "next/link";
import { getSafeSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSafeSession();

  if (session?.user?.role === "BUYER") {
    redirect("/buyer/rfqs");
  }
  if (session?.user?.role === "SUPPLIER") {
    redirect("/supplier/rfqs");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          B2B RFQ Marketplace
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Buyers post requests for quotation. Suppliers browse open RFQs and submit competitive quotes — all in one simple platform.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Log in
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">For buyers</h2>
            <p className="mt-2 text-sm text-slate-600">
              Create RFQs, manage deadlines, and review supplier quotations in one dashboard.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">For suppliers</h2>
            <p className="mt-2 text-sm text-slate-600">
              Browse open opportunities, filter by location, and submit quotations quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
