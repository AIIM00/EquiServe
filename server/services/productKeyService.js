import prisma from "../src/prisma.js";
import crypto, { hash } from "crypto";
import bcrypt from "bcryptjs";

export const getOrCreateMonthlyKey = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    // 1. Generate new key
    const randomBytes = crypto.randomBytes(4).toString("hex").toUpperCase();

    const productKey = `EQUI-${year}${month
      .toString()
      .padStart(2, "0")}-${randomBytes}`;

    const hashedKey = await bcrypt.hash(productKey, 15);
    //
    const keys = await prisma.productKey.findMany({
      where: { used: false },
    });
    for (let keyRecord of keys) {
      const keyUsed = false;
      const match = await bcrypt.compare(productKey, keyRecord.hashedKey);
      match ? (keyUsed = true) : (keyUsed = false);
    }

    if (keyUsed) {
      console.log("Product key already exists. Generating a new one...");
      return await getOrCreateMonthlyKey(); // generate a new key recursively
    }
    // 3. Save to DB
    const newKey = await prisma.productKey.create({
      data: {
        hashedKey,
      },
    });

    //4. Save to Admin
    const currentUsedKey = await prisma.admin.create({
      data: {
        productKey: hashedKey,
      },
    });

    //5. Compare if product key is used before

    console.log(" New Monthly Key Generated:", productKey);

    return { productKey, hashedKey };
  } catch {
    console.error("Error generating product key:", err);
    throw err;
  }
};
