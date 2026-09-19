import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuyerRfqById } from "@/lib/actions/rfq";
import { RfqForm } from "@/components/forms/RfqForm";
import { AppError } from "@/lib/errors";

export default async function EditRfqPage({
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
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-red-600">{loadError ?? "Unable to load RFQ. Please try again."}</p>
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link href={`/buyer/rfqs/${rfq.id}`} className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to RFQ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Edit RFQ</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <RfqForm
            mode="edit"
            rfqId={rfq.id}
            defaultValues={{
              title: rfq.title,
              description: rfq.description,
              quantity: rfq.quantity,
              deliveryLocation: rfq.deliveryLocation,
              deadline: rfq.deadline,
            }}
          />
        </div>
      </div>
    );
}
