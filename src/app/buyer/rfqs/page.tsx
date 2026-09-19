import Link from "next/link";
import { getBuyerRfqs } from "@/lib/queries/rfq";
import { getEffectiveRfqLabel } from "@/lib/rfq";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppError } from "@/lib/errors";

export default async function BuyerRfqsPage() {
  let rfqs;
  let loadError: string | null = null;

  try {
    rfqs = await getBuyerRfqs();
  } catch (error) {
    loadError =
      error instanceof AppError
        ? error.message
        : "Unable to load RFQs. Please try again.";
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My RFQs</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your requests for quotation.</p>
          </div>
          <Link
            href="/buyer/rfqs/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create RFQ
          </Link>
        </div>

        {(rfqs ?? []).length === 0 ? (
          <EmptyState
            title="No RFQs created yet."
            description="Create your first request for quotation to start receiving supplier quotes."
            action={
              <Link
                href="/buyer/rfqs/new"
                className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create RFQ
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Product / service</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Quantity</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Deadline</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Quotes</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(rfqs ?? []).map((rfq) => {
                    const status = getEffectiveRfqLabel(rfq);
                    return (
                      <tr key={rfq.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{rfq.title}</td>
                        <td className="px-4 py-3">{rfq.quantity}</td>
                        <td className="px-4 py-3">{rfq.deliveryLocation}</td>
                        <td className="px-4 py-3">{formatDate(rfq.deadline)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={status.status} />
                        </td>
                        <td className="px-4 py-3">{rfq._count.quotations}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/buyer/rfqs/${rfq.id}`} className="text-blue-600 hover:text-blue-700">
                              View
                            </Link>
                            <Link href={`/buyer/rfqs/${rfq.id}/edit`} className="text-blue-600 hover:text-blue-700">
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 md:hidden">
              {(rfqs ?? []).map((rfq) => {
                const status = getEffectiveRfqLabel(rfq);
                return (
                  <div key={rfq.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-medium text-slate-900">{rfq.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          Qty {rfq.quantity} · {rfq.deliveryLocation}
                        </p>
                      </div>
                      <StatusBadge status={status.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Deadline: {formatDate(rfq.deadline)} · {rfq._count.quotations} quotations
                    </p>
                    <div className="mt-3 flex gap-3 text-sm">
                      <Link href={`/buyer/rfqs/${rfq.id}`} className="text-blue-600">View</Link>
                      <Link href={`/buyer/rfqs/${rfq.id}/edit`} className="text-blue-600">Edit</Link>
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
