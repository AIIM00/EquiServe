import prisma from "../src/prisma.js";

export const isCraftsman = (req, res, next) => {
  if (req.user.role !== "CRAFTSMAN") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};

export const checkCraftsmanStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const craftsman = await prisma.craftsman.findUnique({
      where: { userId },
    });

    if (!craftsman) {
      return res.status(404).json({ message: "Craftsman not found" });
    }

    // 🚫 Not finished application
    if (craftsman.status === "PENDING") {
      return res.status(403).json({
        message: "Complete your application first",
        redirectTo: "/application",
      });
    }

    // 🚫 Suspended
    if (craftsman.status === "SUSPENDED") {
      return res.status(403).json({
        message: "Your account is suspended",
        redirectTo: "/suspended",
      });
    }

    // ✅ Approved → allow access
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
