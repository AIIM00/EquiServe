import prisma from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "at71654325@gmail.com" },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("tiger2003", 10);

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "at71654325@gmail.com",
        password: hashedPassword,
        role: "SUPERADMIN",
        isAccountVerified: true,
      },
    });

    console.log("✅ Admin created");
  } else {
    console.log("⚠️ Admin already exists");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
