import type { Rfq, RfqStatus } from "@prisma/client";

/** RFQ accepts quotations only when OPEN and deadline is in the future. */
export function canAcceptQuotations(rfq: Pick<Rfq, "status" | "deadline">): boolean {
  return rfq.status === "OPEN" && rfq.deadline > new Date();
}

export function isRfqExpired(rfq: Pick<Rfq, "deadline">): boolean {
  return rfq.deadline <= new Date();
}

export function getEffectiveRfqLabel(
  rfq: Pick<Rfq, "status" | "deadline">,
): { status: RfqStatus | "EXPIRED"; label: string } {
  if (rfq.status === "CLOSED") {
    return { status: "CLOSED", label: "Closed" };
  }
  if (isRfqExpired(rfq)) {
    return { status: "EXPIRED", label: "Expired" };
  }
  return { status: "OPEN", label: "Open" };
}
