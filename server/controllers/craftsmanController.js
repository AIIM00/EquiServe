import prisma from "../src/prisma.js";

export const saveApplicationStep = async (req, res) => {
  const userId = req.user.id;
  const { step, data } = req.body;

  try {
    let application = await prisma.application.findFirst({
      where: { userId, status: "DRAFT" },
    });

    if (!application) {
      // create new draft
      application = await prisma.application.create({
        data: {
          userId,
          status: "DRAFT",
          step,
          ...data,
        },
      });
    } else {
      // update existing draft
      application = await prisma.application.update({
        where: { id: application.id },
        data: {
          step,
          ...data,
        },
      });
    }

    res.json({ message: "Step saved", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitApplication = async (req, res) => {
  const userId = req.user.id;

  try {
    const application = await prisma.application.findFirst({
      where: { userId, status: "DRAFT" },
    });

    if (!application) {
      return res.status(400).json({ message: "No draft found" });
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "SUBMITTED",
        step: 4,
      },
    });

    res.json({
      message: "Application submitted successfully",
      application: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dashboard = async (req, res) => {
  try {
    res.json({
      message: "Craftsman dashboard - Welcome to craftsman dashboard",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompletedTasks = async (req, res) => {
  try {
    const craftsmanId = req.user.id;
    const tasks = await prisma.task.findMany({
      where: { craftsmanId, status: "COMPLETED" },
      select: {
        id: true,
        title: true,
        description: true,
        category: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInProgressTasks = async (req, res) => {
  try {
    const craftsmanId = req.user.id;
    const tasks = await prisma.task.findMany({
      where: { craftsmanId, status: "IN_PROGRESS" },
      select: {
        id: true,
        title: true,
        description: true,
        category: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const pendingTasks = async (req, res) => {
  try {
    const craftsmanId = req.user.id;
    const tasks = await prisma.task.findMany({
      where: { craftsmanId, status: "PENDING" },
      select: {
        id: true,
        title: true,
        description: true,
        category: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignRejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const craftsmanId = req.user.id;
    const { action } = req.body;

    const assignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_craftsmanId: {
          taskId,
          craftsmanId,
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.status !== "PENDING") {
      return res.status(400).json({ message: "Already responded" });
    }

    if (action === "ACCEPT") {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "IN_PROGRESS", craftsmanId },
      });

      await prisma.taskAssignment.update({
        where: {
          taskId_craftsmanId: { taskId, craftsmanId },
        },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      });

      return res.json({ message: "Task accepted" });
    }

    if (action === "REJECT") {
      await prisma.taskAssignment.update({
        where: {
          taskId_craftsmanId: { taskId, craftsmanId },
        },
        data: {
          status: "DECLINED",
          respondedAt: new Date(),
        },
      });

      return res.json({ message: "Task rejected" });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const craftsmanId = req.user.id;
    const { name, email, phoneNumber, experience } = req.body;
    const updated = await prisma.user.update({
      where: { id: craftsmanId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });
    await prisma.craftsman.update({
      where: { userId: craftsmanId },
      data: {
        experience,
      },
    });
    res.json({ message: "Profile updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
