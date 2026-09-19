import Link from "next/link";
import { Suspense } from "react";
import { getSupplierRfqs } from "@/lib/queries/rfq";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { SupplierSearchForm } from "@/components/forms/SupplierSearchForm";
import { AppError } from "@/lib/errors";

async function SupplierRfqList({
  search,
  location,
}: {
  search?: string;
  location?: string;
}) {
  let rfqs;
  let loadError: string | null = null;

  try {
    rfqs = await getSupplierRfqs(search, location);
  } catch (error) {
    loadError =
      error instanceof AppError
        ? error.message
        : "Unable to load RFQs. Please try again.";
  }

  if (loadError) {
    return <p className="text-red-600">{loadError}</p>;
  }

  if (!rfqs || rfqs.length === 0) {
    return (
      <EmptyState
        title="No open RFQs found."
        description="Try adjusting your search or check back later for new opportunities."
      />
    );
  }

  return (
      <div className="grid gap-4">
        {rfqs.map((rfq) => (
          <article key={rfq.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{rfq.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{rfq.description}</p>
              </div>
              <Link
                href={`/supplier/rfqs/${rfq.id}`}
                className="inline-flex shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View details
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>Qty: {rfq.quantity}</span>
              <span>Location: {rfq.deliveryLocation}</span>
              <span>Deadline: {formatDate(rfq.deadline)}</span>
              <span>Posted: {formatDate(rfq.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    );
}

export default async function SupplierRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; location?: string }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const location = typeof params.location === "string" ? params.location : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">RFQ Marketplace</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse open requests and submit quotations.
        </p>
      </div>

      <Suspense fallback={<div className="mb-6 h-28 rounded-lg bg-slate-100" />}>
        <SupplierSearchForm />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<p className="text-slate-600">Loading RFQs...</p>}>
          <SupplierRfqList search={search} location={location} />
        </Suspense>
      </div>
    </div>
  );
}
