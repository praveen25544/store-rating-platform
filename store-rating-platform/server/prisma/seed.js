import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hashPassword = (password) => bcrypt.hash(password, 10);

async function main() {
  const passwordHash = await hashPassword("Password@1");

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Primary Platform Administrator",
      email: "admin@example.com",
      address: "Admin office, central business district",
      passwordHash,
      role: "ADMIN"
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Registered Store Owner Account",
      email: "owner@example.com",
      address: "Owner residence, marketplace road",
      passwordHash,
      role: "OWNER"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular Customer Account Holder",
      email: "user@example.com",
      address: "Customer address, residential colony",
      passwordHash,
      role: "USER"
    }
  });

  const store = await prisma.store.upsert({
    where: { email: "freshmart@example.com" },
    update: { ownerId: owner.id },
    create: {
      name: "Freshmart Daily Grocery Store",
      email: "freshmart@example.com",
      address: "12 Market Street, near city square",
      ownerId: owner.id
    }
  });

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId: store.id
      }
    },
    update: { value: 4 },
    create: {
      value: 4,
      userId: user.id,
      storeId: store.id
    }
  });

  console.log("Seed complete.");
  console.log("Admin: admin@example.com / Password@1");
  console.log("Owner: owner@example.com / Password@1");
  console.log("User: user@example.com / Password@1");
  console.log(`Created admin ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
