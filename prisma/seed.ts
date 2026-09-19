import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      name: "Demo Buyer",
      email: "buyer@example.com",
      passwordHash,
      role: "BUYER",
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: "supplier@example.com" },
    update: {},
    create: {
      name: "Demo Supplier",
      email: "supplier@example.com",
      passwordHash,
      role: "SUPPLIER",
    },
  });

  const existingRfqs = await prisma.rfq.count({ where: { buyerId: buyer.id } });

  if (existingRfqs === 0) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    const rfq1 = await prisma.rfq.create({
      data: {
        buyerId: buyer.id,
        title: "Industrial Steel Pipes",
        description: "Need 500 units of 2-inch industrial grade steel pipes for warehouse construction.",
        quantity: 500,
        deliveryLocation: "Pune, Maharashtra",
        deadline,
        status: "OPEN",
      },
    });

    const rfq2Deadline = new Date();
    rfq2Deadline.setDate(rfq2Deadline.getDate() + 21);

    await prisma.rfq.create({
      data: {
        buyerId: buyer.id,
        title: "Office Furniture Package",
        description: "Ergonomic chairs and standing desks for a 50-person office setup.",
        quantity: 50,
        deliveryLocation: "Bengaluru, Karnataka",
        deadline: rfq2Deadline,
        status: "OPEN",
      },
    });

    await prisma.quotation.create({
      data: {
        rfqId: rfq1.id,
        supplierId: supplier.id,
        price: 125000,
        estimatedDelivery: "10 business days",
        message: "Includes standard packaging and delivery to Pune warehouse.",
      },
    });
  }

  console.log("Seed completed.");
  console.log("Demo accounts:");
  console.log("  buyer@example.com / password123");
  console.log("  supplier@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
