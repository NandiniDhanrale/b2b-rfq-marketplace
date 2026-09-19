"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { quotationSchema } from "@/lib/validations/quotation";
import { canAcceptQuotations } from "@/lib/rfq";

export async function submitQuotationAction(rfqId: string, formData: FormData) {
  const supplier = await requireRole("SUPPLIER");

  const parsed = quotationSchema.safeParse({
    price: formData.get("price"),
    estimatedDelivery: formData.get("estimatedDelivery"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) {
    throw new AppError("RFQ not found", 404);
  }
  if (!canAcceptQuotations(rfq)) {
    throw new AppError("This RFQ is no longer accepting quotations", 400);
  }

  const existing = await prisma.quotation.findUnique({
    where: { rfqId_supplierId: { rfqId, supplierId: supplier.id } },
  });

  if (existing) {
    throw new AppError("You have already submitted a quotation for this RFQ", 409);
  }

  await prisma.quotation.create({
    data: {
      rfqId,
      supplierId: supplier.id,
      price: parsed.data.price,
      estimatedDelivery: parsed.data.estimatedDelivery,
      message: parsed.data.message || null,
    },
  });

  revalidatePath("/supplier/rfqs");
  revalidatePath(`/supplier/rfqs/${rfqId}`);
  revalidatePath("/supplier/quotations");
  revalidatePath(`/buyer/rfqs/${rfqId}`);
  return { success: true };
}

export async function updateQuotationAction(quotationId: string, formData: FormData) {
  const supplier = await requireRole("SUPPLIER");

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true },
  });

  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }
  if (quotation.supplierId !== supplier.id) {
    throw new AppError("You are not authorized to edit this quotation", 403);
  }
  if (!canAcceptQuotations(quotation.rfq)) {
    throw new AppError("This RFQ is no longer accepting quotation updates", 400);
  }

  const parsed = quotationSchema.safeParse({
    price: formData.get("price"),
    estimatedDelivery: formData.get("estimatedDelivery"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  await prisma.quotation.update({
    where: { id: quotationId },
    data: {
      price: parsed.data.price,
      estimatedDelivery: parsed.data.estimatedDelivery,
      message: parsed.data.message || null,
    },
  });

  revalidatePath("/supplier/quotations");
  revalidatePath(`/supplier/rfqs/${quotation.rfqId}`);
  revalidatePath(`/buyer/rfqs/${quotation.rfqId}`);
  return { success: true };
}

