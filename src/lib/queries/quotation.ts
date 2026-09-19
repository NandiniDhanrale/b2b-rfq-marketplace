import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function getSupplierQuotations() {
  const supplier = await requireRole("SUPPLIER");

  return prisma.quotation.findMany({
    where: { supplierId: supplier.id },
    include: { rfq: true },
    orderBy: { createdAt: "desc" },
  });
}
