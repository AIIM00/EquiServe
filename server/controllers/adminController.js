import prisma from "../src/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";

//DASHBOARD FEATURES

//ADD ADMIN

export const addAdmin = async (req, res) => {
  const { email } = req.body;
  const adminId = req.user.id; //currentlyl logged-in admin
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  const existingInvite = await prisma.adminInvite.findUnique({
    where: { email },
  });

  if (!existing) {
    if (
      existingInvite &&
      !existingInvite.used &&
      existingInvite.expiresAt > new Date()
    ) {
      return res
        .status(400)
        .json({ message: "An active invite already exists for this email" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours
    //Save invite to DB
    await prisma.adminInvite.create({
      data: {
        email,
        token,
        expiresAt,
        createdBy: adminId,
      },
    });
    //Send email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Admin invitation to EquiServe Dashboard",
      text: `Hi,

You have been invited to become an admin on EquiServe.

Click the link below to set your password and login:

${process.env.FRONTEND_URL}/admin/invite?token=${token}

This link will expire in 24 hours.

Best,
The EquiServe Team
`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "Invitation sent successfully" });
  } else {
    return res.status(400).json({ message: "Admin already exists" });
  }
};

//ACCEPT ADMIN REQUEST
export const acceptAdminInvite = async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //  Find invite
    const invite = req.invite; //FROM MIDDLEWARE

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create the admin user using invite email
    const admin = await prisma.user.create({
      data: {
        name: name,
        email: invite.email,
        password: hashedPassword,
        phoneNumber,
        role: "ADMIN",
        isAccountVerified: true,
      },
    });

    // Mark invite as used
    await prisma.adminInvite.update({
      where: { token: invite.token },
      data: { used: true },
    });
    res.json({ message: "Admin account created successfully", admin });
  } catch (error) {
    console.error("Error accepting admin invite:", error);
    res.status(500).json({ message: "Internal2 server error" });
  }
};

//ADMIN INFO
export const adminInfo = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });
    console.log("The admin info:", admin.name, admin.email, admin.phoneNumber);

    res.status(200).json({
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//Get all customers data
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isAccountVerified: true,
        role: true,
      },
    });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//GET ALL CRAFTSMEN DATA
export const getAllCraftsmen = async (req, res) => {
  try {
    const craftsmen = await prisma.user.findMany({
      where: { role: "CRAFTSMAN" },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isAccountVerified: true,
        craftsman: {
          select: {
            warningLevel: true,
          },
        },
        role: true,
      },
    });
    res.json(craftsmen);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GET USER DATA BY ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAccountVerified: true,
        role: true,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE USER BY ID
export const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//CRAFTSMAN APPLICATIONS
export const getCraftsmanApplication = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { status: "SUBMITTED" },
      select: {
        id: true,
        category: {
          select: { name: true },
        },
        yearsOfExperience: true,
        city: true,
        workingDays: true,
        workingHours: true,
        maxTravelDistance: true,
        scenarioQA: true,
        workBehaviorQA: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(applications);
  } catch (error) {
    console.error("Error finding applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//APPROVE || REJECT || SUSPEND CRAFTSMAN
export const updateApplicationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // "APPROVED" or "REJECTED"
    if (status === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        const application = await tx.application.findUnique({
          where: { userId },
        });
        if (!application) {
          throw new Error("Application not found");
        }
        if (!application.categoryId) {
          throw new Error("Application has no category");
        }
        const last = await tx.craftsman.findFirst({
          where: {
            categoryId: application.categoryId,
            queueOrder: { not: null },
          },
          orderBy: { queueOrder: "desc" },
          select: { queueOrder: true },
        });

        const nextOrder = (last?.queueOrder ?? 0) + 1;
        await tx.craftsman.update({
          where: { userId },
          data: {
            status: "APPROVED",
            categoryId: application.categoryId,
            queueOrder: nextOrder,
            experience: application.yearsOfExperience,
          },
        });
        await tx.application.update({
          where: { userId },
          data: { status: "APPROVED" },
        });
      });
      return res.json({ message: "Craftsman approved successfully" });
    } else if (status === "REJECTED") {
      await prisma.$transaction(async (tx) => {
        const application = await tx.application.findUnique({
          where: { userId },
        });

        if (!application) {
          throw new Error("Application not found");
        }

        await tx.craftsman.update({
          where: { userId },
          data: { status: "REJECTED" },
        });

        await tx.application.update({
          where: { userId },
          data: { status: "REJECTED" },
        });
      });

      return res.json({ message: "Craftsman rejected successfully" });
    } else if (status === "SUSPENDED") {
      await prisma.craftsman.update({
        where: { userId },
        data: { status: "SUSPENDED" },
      });

      return res.json({ message: "Craftsman suspended successfully" });
    }

    return res.status(400).json({ message: "Invalid status value" });
    //⚠️SEND EMAIL AFTER APPROVAL/REJECTION/SUSPENSION
  } catch (error) {
    console.error(error);
    if (error.message === "Application not found") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Application has no category") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

//CRAFTSMAN INVENTORY BY CATEGORY AND AVAILIBILTY
export const getCraftsmenCountByCategory = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        craftsmen: {
          where: { availability: "AVAILABLE" },
          select: { userId: true },
        },
      },
    });
    const result = categories.map((cat) => ({
      categoryId: cat.id,
      category: cat.name,
      count: cat.craftsmen.length,
      craftsmen: cat.craftsmen,
    }));
    res.json(result);
  } catch (error) {
    console.error("Error finding craftsmen:", error);
    res.status(500).json({ message: "Interval server error" });
  }
};

//GET IN PROGRESS TASKS
export const inProgressTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { status: "IN_PROGRESS" },
      select: {
        title: true,
        description: true,
        createdAt: true,
        userId: true,
        categoryId: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error("Error finding in progress tasks:", error);
    res.status(500).json({ message: "Interval message error." });
  }
};

//GET CUSTOMERS REVIEWS

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
          },
        },

        craftsman: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },

        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateWarningLevel = async (craftsmanId) => {
  // 1️⃣ LAST 10 COMPLETED TASKS
  const lastTasks = await prisma.taskCompletion.findMany({
    where: { craftsmanId },
    orderBy: { completedAt: "desc" },
    take: 10,
    select: { taskId: true },
  });

  const taskIds = lastTasks.map((t) => t.taskId);

  // 2️⃣ COUNT WARNINGS IN THOSE TASKS
  const warningsCount = await prisma.warning.count({
    where: {
      craftsmanId,
      taskId: { in: taskIds },
    },
  });

  // 3️⃣ DETERMINE LEVEL
  let level = "NONE";
  if (warningsCount === 1) level = "LOW";
  else if (warningsCount === 2) level = "MEDIUM";
  else if (warningsCount >= 3) level = "HIGH";

  // UPDATE WARNING LEVEL
  await prisma.craftsman.update({
    where: { userId: craftsmanId },
    data: { warningLevel: level },
  });

  return {
    warningsCount,
    level,
    lastTasksCount: lastTasks.length,
  };
};
//CREATE WARNINGS

export const createWarning = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { message, taskId } = req.body;
    const craftsmanId = req.params.craftsmanId;

    if (!craftsmanId || !message || !taskId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const warning = await prisma.warning.create({
      data: {
        message,
        craftsmanId,
        adminId,
        taskId,
      },
    });
    const stats = await updateWarningLevel(craftsmanId);
    return res.status(201).json({
      message: "Warning sent successfully",
      warning,
      warningLevel: stats.level,
      warningCount: stats.warningsCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//REMOVE WARNING

export const removeWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    const warning = await prisma.warning.findUnique({
      where: { id: warningId },
    });

    if (!warning) {
      return res.status(404).json({ message: "Warning not found" });
    }

    const craftsmanId = warning.craftsmanId;

    // DELETE WARNING
    await prisma.warning.delete({
      where: { id: warningId },
    });

    // UPDATE WARNING LEVEL AFTER DELETION
    const stats = await updateWarningLevel(craftsmanId);

    return res.json({
      message: "Warning removed successfully",
      warningLevel: stats.level,
      warningsCount: stats.warningsCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getFlaggedCraftsmen = async (req, res) => {
  try {
    const craftsmen = await prisma.craftsman.findMany({
      select: {
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const result = [];
    for (let c of craftsmen) {
      const stats = await updateWarningLevel(c.userId);

      if (stats.warningsCount >= 3) {
        result.push({
          craftsmanId: c.userId,
          name: c.user.name,
          email: c.user.email,
          warningsCount: stats.warningsCount,
          level: stats.level,
          message: `This craftsman reached ${stats.warningsCount} warnings in last 10 tasks`,
          action: "REMOVE or KEEP",
        });
      }
    }

    if (result.length === 0) {
      return res.json({ message: "There is not any flagged craftsman." });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//RESTORE CRAFTSMAN
export const restoreCraftsman = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1- CHECK CRAFTSMAN EXISTS
    const craftsman = await prisma.craftsman.findUnique({
      where: { userId },
    });

    if (!craftsman) {
      return res.status(404).json({ message: "Craftsman not found" });
    }

    // 2- ENSURE HE IS SUSPENDED
    if (craftsman.status !== "SUSPENDED") {
      return res.status(400).json({
        message: "Only suspended craftsmen can be restored",
      });
    }

    // 3- DELETE ALL WARNINGS
    await prisma.warning.deleteMany({
      where: { craftsmanId: userId },
    });

    // 4- RESET CRAFTSMAN
    const updatedCraftsman = await prisma.craftsman.update({
      where: { userId },
      data: {
        status: "APPROVED",
        warningLevel: "NONE",
      },
    });

    return res.json({
      message: "Craftsman restored successfully",
      craftsman: updatedCraftsman,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeCraftsman = async (req, res) => {
  const { craftsmanId } = req.params;

  await prisma.craftsman.update({
    where: { userId: craftsmanId },
    data: {
      status: "SUSPENDED", // BANNED
    },
  });

  res.json({ message: "Craftsman removed" });
};
