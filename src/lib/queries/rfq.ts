import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { canAcceptQuotations } from "@/lib/rfq";

export async function getBuyerRfqs() {
  const buyer = await requireRole("BUYER");

  return prisma.rfq.findMany({
    where: { buyerId: buyer.id },
    include: { _count: { select: { quotations: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBuyerRfqById(rfqId: string) {
  const buyer = await requireRole("BUYER");

  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: {
      quotations: {
        include: { supplier: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!rfq) {
    throw new AppError("RFQ not found", 404);
  }
  if (rfq.buyerId !== buyer.id) {
    throw new AppError("You are not authorized to view this RFQ", 403);
  }

  return rfq;
}

export async function getSupplierRfqs(search?: string, location?: string) {
  await requireRole("SUPPLIER");

  const now = new Date();

  return prisma.rfq.findMany({
    where: {
      status: "OPEN",
      deadline: { gt: now },
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(location
        ? { deliveryLocation: { contains: location, mode: "insensitive" } }
        : {}),
    },
    include: { buyer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSupplierRfqById(rfqId: string) {
  const supplier = await requireRole("SUPPLIER");

  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: {
      quotations: {
        where: { supplierId: supplier.id },
        take: 1,
      },
    },
  });

  if (!rfq) {
    throw new AppError("RFQ not found", 404);
  }

  return {
    rfq,
    existingQuotation: rfq.quotations[0] ?? null,
    canQuote: canAcceptQuotations(rfq),
  };
}
