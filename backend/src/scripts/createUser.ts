import "dotenv/config";
import { prisma } from "../config/prismaClient.js";
import bcrypt from "bcryptjs";
import { createUserService } from "../modules/login/login.services.js";

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const user = await createUserService({
      email: "financial@example.com",
      name: "Trial User",
      username: "admin1234",
      password: hashedPassword,
      roleIds: [1]
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
