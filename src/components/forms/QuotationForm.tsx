"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuotationAction, updateQuotationAction } from "@/lib/actions/quotation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getErrorMessage } from "@/lib/errors";

type QuotationFormProps = {
  rfqId: string;
  quotationId?: string;
  defaultValues?: {
    price: number;
    estimatedDelivery: string;
    message?: string | null;
  };
};

export function QuotationForm({ rfqId, quotationId, defaultValues }: QuotationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(quotationId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        if (isEdit && quotationId) {
          await updateQuotationAction(quotationId, formData);
        } else {
          await submitQuotationAction(rfqId, formData);
        }
        router.push(`/supplier/rfqs/${rfqId}`);
        router.refresh();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Input
        label="Quoted price (INR)"
        name="price"
        type="number"
        min={0.01}
        step="0.01"
        required
        defaultValue={defaultValues?.price}
      />
      <Input
        label="Estimated delivery time"
        name="estimatedDelivery"
        required
        placeholder="e.g. 7 business days"
        defaultValue={defaultValues?.estimatedDelivery}
      />
      <Textarea
        label="Message / notes"
        name="message"
        rows={4}
        defaultValue={defaultValues?.message ?? ""}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : isEdit ? "Update quotation" : "Submit quotation"}
      </Button>
    </form>
  );
}
