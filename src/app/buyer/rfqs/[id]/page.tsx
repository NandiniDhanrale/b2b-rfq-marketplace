import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuyerRfqById } from "@/lib/actions/rfq";
import { getEffectiveRfqLabel } from "@/lib/rfq";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CloseRfqButton } from "@/components/forms/CloseRfqButton";
import { AppError } from "@/lib/errors";

export default async function BuyerRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let rfq;
  let loadError: string | null = null;

  try {
    rfq = await getBuyerRfqById(id);
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) notFound();
      loadError = error.message;
    } else {
      loadError = "Unable to load RFQ. Please try again.";
    }
  }

  if (loadError || !rfq) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-red-600">{loadError ?? "Unable to load RFQ. Please try again."}</p>
      </div>
    );
  }

  const status = getEffectiveRfqLabel(rfq);

  return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/buyer/rfqs" className="text-sm text-blue-600 hover:text-blue-700">
              ← Back to RFQs
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{rfq.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={status.status} />
              <span className="text-sm text-slate-600">Created {formatDate(rfq.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/buyer/rfqs/${rfq.id}/edit`}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              Edit
            </Link>
            {rfq.status === "OPEN" && <CloseRfqButton rfqId={rfq.id} />}
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-medium text-slate-900">RFQ details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-900">{rfq.description}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Quantity</dt>
                <dd className="mt-1 text-slate-900">{rfq.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Delivery location</dt>
                <dd className="mt-1 text-slate-900">{rfq.deliveryLocation}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Deadline</dt>
                <dd className="mt-1 text-slate-900">{formatDate(rfq.deadline)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-medium text-slate-900">Quotations received</h2>
            {rfq.quotations.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No quotations received yet." />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {rfq.quotations.map((quotation) => (
                  <div key={quotation.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{quotation.supplier.name}</p>
                        <p className="text-sm text-slate-600">Submitted {formatDate(quotation.createdAt)}</p>
                      </div>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(quotation.price.toString())}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">
                      <span className="font-medium">Estimated delivery:</span> {quotation.estimatedDelivery}
                    </p>
                    {quotation.message && (
                      <p className="mt-2 text-sm text-slate-600">{quotation.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
}
