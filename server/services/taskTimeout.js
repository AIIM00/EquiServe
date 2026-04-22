import prisma from "../src/prisma.js";
import { assignNextCraftsman } from "../services/taskAssignmentService.js";

const ASSIGNMENT_TIMEOUT_MINUTES = 10;

export const processTimedOutAssignments = async () => {
  try {
    const timeoutDate = new Date(
      Date.now() - ASSIGNMENT_TIMEOUT_MINUTES * 60 * 1000,
    );

    const expiredAssignments = await prisma.taskAssignment.findMany({
      where: {
        status: "PENDING",
        assignedAt: {
          lte: timeoutDate,
        },
      },
      select: {
        id: true,
        taskId: true,
        craftsmanId: true,
      },
    });

    if (!expiredAssignments.length) {
      console.log("No timed out assignments found.");
      return;
    }

    console.log(`Found ${expiredAssignments.length} timed out assignments.`);

    for (const assignment of expiredAssignments) {
      try {
        const timedOut = await prisma.$transaction(async (tx) => {
          const freshAssignment = await tx.taskAssignment.findUnique({
            where: { id: assignment.id },
            select: {
              id: true,
              status: true,
              taskId: true,
            },
          });

          if (!freshAssignment || freshAssignment.status !== "PENDING") {
            return false;
          }

          const task = await tx.task.findUnique({
            where: { id: freshAssignment.taskId },
            select: {
              status: true,
              craftsmanId: true,
            },
          });

          if (!task || task.status === "IN_PROGRESS" || task.craftsmanId) {
            return false;
          }

          await tx.taskAssignment.update({
            where: { id: assignment.id },
            data: {
              status: "TIMEOUT",
              respondedAt: new Date(),
            },
          });

          return true;
        });

        if (!timedOut) {
          continue;
        }

        try {
          const nextAssignment = await assignNextCraftsman(assignment.taskId);
          console.log(
            `Task ${assignment.taskId} reassigned to craftsman ${nextAssignment.craftsmanId}`,
          );
        } catch (reassignError) {
          console.log(
            `Task ${assignment.taskId} timed out, but no more craftsmen available: ${reassignError.message}`,
          );

          await prisma.task.update({
            where: { id: assignment.taskId },
            data: {
              status: "PENDING",
            },
          });
        }
      } catch (err) {
        console.error(
          `Failed processing timeout for assignment ${assignment.id}:`,
          err.message,
        );
      }
    }
  } catch (error) {
    console.error("Timeout job failed:", error.message);
  }
};
