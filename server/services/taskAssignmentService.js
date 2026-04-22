import prisma from "../src/prisma.js";

export const assignNextCraftsman = async (taskId) => {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { category: true, assignments: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.status === "IN_PROGRESS" && task.craftsmanId) {
      return { message: "Task already assigned" };
    }

    const craftsmen = await tx.craftsman.findMany({
      where: {
        categoryId: task.categoryId,
        status: "APPROVED",
        isAvailable: true,
      },
      orderBy: {
        queueOrder: "asc",
      },
      select: {
        userId: true,
      },
    });

    if (!craftsmen.length) {
      throw new Error("No available craftsmen for this category");
    }

    const alreadyTried = new Set(task.assignments.map((a) => a.craftsmanId));

    const queue = await tx.categoryAssignmentQueue.upsert({
      where: { categoryId: task.categoryId },
      update: {},
      create: { categoryId: task.categoryId },
    });

    let startIndex = 0;

    if (queue.lastAssignedTo) {
      const lastIndex = craftsmen.findIndex(
        (c) => c.userId === queue.lastAssignedTo,
      );
      if (lastIndex !== -1) {
        startIndex = (lastIndex + 1) % craftsmen.length;
      }
    }

    let selectedCraftsman = null;

    for (let i = 0; i < craftsmen.length; i++) {
      const index = (startIndex + i) % craftsmen.length;
      const candidate = craftsmen[index];

      if (!alreadyTried.has(candidate.userId)) {
        selectedCraftsman = candidate;
        break;
      }
    }

    if (!selectedCraftsman) {
      throw new Error(
        "All craftsmen in this category already declined or timed out",
      );
    }

    await tx.taskAssignment.create({
      data: {
        taskId: task.id,
        craftsmanId: selectedCraftsman.userId,
        status: "PENDING",
      },
    });

    await tx.task.update({
      where: { id: task.id },
      data: { status: "WAITING" },
    });

    await tx.categoryAssignmentQueue.update({
      where: { categoryId: task.categoryId },
      data: { lastAssignedTo: selectedCraftsman.userId },
    });

    return {
      taskId: task.id,
      craftsmanId: selectedCraftsman.userId,
    };
  });
};
