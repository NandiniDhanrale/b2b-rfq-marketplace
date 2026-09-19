"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRfqAction, updateRfqAction } from "@/lib/actions/rfq";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getErrorMessage } from "@/lib/errors";
import { toDatetimeLocalValue } from "@/lib/utils";

type RfqFormProps = {
  mode: "create" | "edit";
  rfqId?: string;
  defaultValues?: {
    title: string;
    description: string;
    quantity: number;
    deliveryLocation: string;
    deadline: Date;
  };
};

export function RfqForm({ mode, rfqId, defaultValues }: RfqFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createRfqAction(formData);
          router.push(`/buyer/rfqs/${result.id}`);
        } else if (rfqId) {
          await updateRfqAction(rfqId, formData);
          router.push(`/buyer/rfqs/${rfqId}`);
        }
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
        label="Product / service name"
        name="title"
        required
        maxLength={200}
        defaultValue={defaultValues?.title}
      />
      <Textarea
        label="Requirement description"
        name="description"
        required
        rows={5}
        defaultValue={defaultValues?.description}
      />
      <Input
        label="Quantity"
        name="quantity"
        type="number"
        min={1}
        required
        defaultValue={defaultValues?.quantity}
      />
      <Input
        label="Delivery location"
        name="deliveryLocation"
        required
        maxLength={200}
        defaultValue={defaultValues?.deliveryLocation}
      />
      <Input
        label="RFQ deadline"
        name="deadline"
        type="datetime-local"
        required
        defaultValue={defaultValues ? toDatetimeLocalValue(defaultValues.deadline) : undefined}
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create RFQ" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
