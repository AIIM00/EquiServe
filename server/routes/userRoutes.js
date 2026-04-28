import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  browseServices,
  bookTask,
  getUserBookings,
  cancelBooking,
  trackTask,
  leaveReview,
  getUserData,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/services", userAuth, browseServices);
userRouter.post("/book", userAuth, bookTask);
userRouter.get("/bookings", userAuth, getUserBookings);
userRouter.post("/cancel/:taskId", userAuth, cancelBooking);
userRouter.get("/track/:taskId", userAuth, trackTask);
userRouter.post("/review/:taskId", userAuth, leaveReview);
userRouter.get("/data", getUserData);
export default userRouter;
