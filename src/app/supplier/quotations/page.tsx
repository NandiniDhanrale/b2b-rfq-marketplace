import Link from "next/link";
import { getSupplierQuotations } from "@/lib/actions/quotation";
import { getEffectiveRfqLabel } from "@/lib/rfq";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppError } from "@/lib/errors";

export default async function SupplierQuotationsPage() {
  let quotations;
  let loadError: string | null = null;

  try {
    quotations = await getSupplierQuotations();
  } catch (error) {
    loadError =
      error instanceof AppError
        ? error.message
        : "Unable to load quotations. Please try again.";
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-red-600">{loadError}</p>
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">My Quotations</h1>
        <p className="mt-1 text-sm text-slate-600">Track all quotations you have submitted.</p>

        {(quotations ?? []).length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No quotations submitted yet."
              description="Browse the marketplace and submit your first quotation."
              action={
                <Link
                  href="/supplier/rfqs"
                  className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Browse RFQs
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">RFQ</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Delivery</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">RFQ deadline</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">RFQ status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(quotations ?? []).map((quotation) => {
                    const status = getEffectiveRfqLabel(quotation.rfq);
                    return (
                      <tr key={quotation.id}>
                        <td className="px-4 py-3">
                          <Link href={`/supplier/rfqs/${quotation.rfqId}`} className="font-medium text-blue-600 hover:text-blue-700">
                            {quotation.rfq.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{formatCurrency(quotation.price.toString())}</td>
                        <td className="px-4 py-3">{quotation.estimatedDelivery}</td>
                        <td className="px-4 py-3">{formatDate(quotation.rfq.deadline)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={status.status} />
                        </td>
                        <td className="px-4 py-3">{formatDate(quotation.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 md:hidden">
              {(quotations ?? []).map((quotation) => {
                const status = getEffectiveRfqLabel(quotation.rfq);
                return (
                  <div key={quotation.id} className="p-4">
                    <Link href={`/supplier/rfqs/${quotation.rfqId}`} className="font-medium text-blue-600">
                      {quotation.rfq.title}
                    </Link>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatCurrency(quotation.price.toString())} · {quotation.estimatedDelivery}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={status.status} />
                      <span className="text-sm text-slate-600">Submitted {formatDate(quotation.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
}
