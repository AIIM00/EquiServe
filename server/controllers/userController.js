import prisma from "../src/prisma.js";
import { assignNextCraftsman } from "../services/taskAssignmentService.js";

//Get All services categories
export const browseServices = async (req, res) => {
  try {
    const services = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Book a service

export const bookTask = async (req, res) => {
  try {
    const { categoryName, description, location } = req.body;
    const userId = req.user.id;
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const booking = await prisma.task.create({
      data: {
        userId,
        categoryId: category.id,
        title: `Service request for ${category.name}`,
        description,
        location,
        status: "PENDING",
        createdAt: new Date(),
      },
    });
    try {
      await assignNextCraftsman(booking.id);
    } catch (assignError) {
      console.error("Auto-assignment failed:", assignError.message);
    }
    res.json({ message: "Service booked successfully", booking });
  } catch (error) {
    console.error("Error booking service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await prisma.task.findMany({
      where: { userId },
      include: {
        category: true,
        craftsman: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const booking = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Track booking status
export const trackTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const booking = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        category: true,
        craftsman: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json({
      status: booking.status,
      assignedCraftsman: booking.craftsman,
    });
  } catch (error) {
    console.error("Error tracking booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//leave feedback for a completed service
export const leaveReview = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const { rating, comment } = req.body;
    const booking = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (booking.status !== "COMPLETED") {
      return res
        .status(400)
        .json({ message: "Cannot leave review for incomplete service" });
    }
    if (!booking.craftsmanId) {
      return res
        .status(400)
        .json({ message: "No craftsman assigned to this task" });
    }
    const review = await prisma.review.create({
      data: {
        taskId,
        userId,
        craftsmanId: booking.craftsmanId,
        rating,
        comment,
        createdAt: new Date(),
      },
    });
    res.json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
