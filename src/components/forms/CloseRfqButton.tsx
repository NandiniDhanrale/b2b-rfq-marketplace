"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { closeRfqAction } from "@/lib/actions/rfq";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getErrorMessage } from "@/lib/errors";

export function CloseRfqButton({ rfqId }: { rfqId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    if (!confirm("Close this RFQ? Suppliers will no longer be able to submit quotations.")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await closeRfqAction(rfqId);
        router.refresh();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <Alert>{error}</Alert>}
      <Button type="button" variant="danger" onClick={handleClose} disabled={isPending}>
        {isPending ? "Closing..." : "Close RFQ"}
      </Button>
    </div>
  );
}
