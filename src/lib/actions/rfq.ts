"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { createRfqSchema, updateRfqSchema } from "@/lib/validations/rfq";

export async function createRfqAction(formData: FormData) {
  const buyer = await requireRole("BUYER");

  const parsed = createRfqSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    deliveryLocation: formData.get("deliveryLocation"),
    deadline: formData.get("deadline"),
  });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const rfq = await prisma.rfq.create({
    data: {
      ...parsed.data,
      buyerId: buyer.id,
    },
  });

  revalidatePath("/buyer/rfqs");
  return { id: rfq.id };
}

export async function updateRfqAction(rfqId: string, formData: FormData) {
  const buyer = await requireRole("BUYER");

  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) {
    throw new AppError("RFQ not found", 404);
  }
  if (rfq.buyerId !== buyer.id) {
    throw new AppError("You are not authorized to edit this RFQ", 403);
  }

  const parsed = updateRfqSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    quantity: formData.get("quantity") || undefined,
    deliveryLocation: formData.get("deliveryLocation") || undefined,
    deadline: formData.get("deadline") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  await prisma.rfq.update({
    where: { id: rfqId },
    data: parsed.data,
  });

  revalidatePath("/buyer/rfqs");
  revalidatePath(`/buyer/rfqs/${rfqId}`);
  revalidatePath(`/buyer/rfqs/${rfqId}/edit`);
  revalidatePath("/supplier/rfqs");
  return { success: true };
}

export async function closeRfqAction(rfqId: string) {
  const buyer = await requireRole("BUYER");

  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) {
    throw new AppError("RFQ not found", 404);
  }
  if (rfq.buyerId !== buyer.id) {
    throw new AppError("You are not authorized to close this RFQ", 403);
  }

  await prisma.rfq.update({
    where: { id: rfqId },
    data: { status: "CLOSED" },
  });

  revalidatePath("/buyer/rfqs");
  revalidatePath(`/buyer/rfqs/${rfqId}`);
  revalidatePath("/supplier/rfqs");
  return { success: true };
}
