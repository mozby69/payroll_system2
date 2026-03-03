import "dotenv/config";
import { prisma } from "../config/prismaClient.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "financial@example.com",
      name: "Trial User",
      username: "financial",
      password: hashedPassword,
    },
  });

  console.log("User created:", user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
