import prisma from "../src/prisma.js";

export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Only SUPERADMIN can do this" });
  }
  next();
};
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "SUPERADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};

export const inviteCheck = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // 1️⃣ Find invite by token
    const invite = await prisma.adminInvite.findUnique({
      where: { token },
    });

    // 2️⃣ Validate
    if (!invite) {
      return res.status(404).json({ message: "Invalid invite link" });
    }

    if (invite.used) {
      return res.status(400).json({ message: "Invite already used" });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invite expired" });
    }

    // 3️⃣ Attach invite to request
    req.invite = invite;

    next();
  } catch (error) {
    console.error("Invite check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
