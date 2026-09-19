import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupplierRfqById } from "@/lib/queries/rfq";
import { getEffectiveRfqLabel } from "@/lib/rfq";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QuotationForm } from "@/components/forms/QuotationForm";
import { Alert } from "@/components/ui/Alert";
import { AppError } from "@/lib/errors";

export default async function SupplierRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  let loadError: string | null = null;

  try {
    data = await getSupplierRfqById(id);
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) notFound();
      loadError = error.message;
    } else {
      loadError = "Unable to load RFQ. Please try again.";
    }
  }

  if (loadError || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-red-600">{loadError ?? "Unable to load RFQ. Please try again."}</p>
      </div>
    );
  }

  const { rfq, existingQuotation, canQuote } = data;
  const status = getEffectiveRfqLabel(rfq);

  return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/supplier/rfqs" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to marketplace
        </Link>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{rfq.title}</h1>
              <p className="mt-2 text-sm text-slate-600">Posted {formatDate(rfq.createdAt)}</p>
            </div>
            <StatusBadge status={status.status} />
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">Requirement description</dt>
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
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-medium text-slate-900">Quotation</h2>

          {existingQuotation ? (
            <div className="mt-4 space-y-4">
              <Alert variant="info">You have already submitted a quotation for this RFQ.</Alert>
              <div className="rounded-lg border border-slate-200 p-4 text-sm">
                <p><span className="font-medium">Price:</span> {formatCurrency(existingQuotation.price.toString())}</p>
                <p className="mt-2"><span className="font-medium">Estimated delivery:</span> {existingQuotation.estimatedDelivery}</p>
                {existingQuotation.message && (
                  <p className="mt-2"><span className="font-medium">Message:</span> {existingQuotation.message}</p>
                )}
                <p className="mt-2 text-slate-600">Submitted {formatDate(existingQuotation.createdAt)}</p>
              </div>
              {canQuote && (
                <div>
                  <h3 className="mb-3 font-medium text-slate-900">Edit quotation</h3>
                  <QuotationForm
                    rfqId={rfq.id}
                    quotationId={existingQuotation.id}
                    defaultValues={{
                      price: Number(existingQuotation.price),
                      estimatedDelivery: existingQuotation.estimatedDelivery,
                      message: existingQuotation.message,
                    }}
                  />
                </div>
              )}
            </div>
          ) : canQuote ? (
            <div className="mt-4">
              <QuotationForm rfqId={rfq.id} />
            </div>
          ) : (
            <Alert variant="info">
              This RFQ is {status.label.toLowerCase()} and no longer accepts new quotations.
            </Alert>
          )}
        </section>
      </div>
    );
}
