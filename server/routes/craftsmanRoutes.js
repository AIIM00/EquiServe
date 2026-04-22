import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  isCraftsman,
  checkCraftsmanStatus,
} from "../middleware/craftsmanAuth.js";
import {
  saveApplicationStep,
  submitApplication,
  dashboard,
  getCompletedTasks,
  getInProgressTasks,
  pendingTasks,
  assignRejectTask,
  updateProfile,
} from "../controllers/craftsmanController.js";

export const craftsmanRouter = express.Router();

craftsmanRouter.post(
  "/applications/save",
  userAuth,
  isCraftsman,
  saveApplicationStep,
);
craftsmanRouter.post(
  "/applications/submit",
  userAuth,
  isCraftsman,
  submitApplication,
);

craftsmanRouter.get(
  "/dashboard",
  userAuth,
  isCraftsman,
  checkCraftsmanStatus,
  dashboard,
);
craftsmanRouter.get(
  "/tasks/completed",
  userAuth,
  isCraftsman,
  getCompletedTasks,
);
craftsmanRouter.get(
  "/tasks/inProgress",
  userAuth,
  isCraftsman,
  getInProgressTasks,
);
craftsmanRouter.get(
  "/tasks/pending",
  userAuth,
  isCraftsman,
  checkCraftsmanStatus,
  pendingTasks,
);
craftsmanRouter.patch(
  "/tasks/:taskId/respond",
  userAuth,
  isCraftsman,
  checkCraftsmanStatus,
  assignRejectTask,
);

craftsmanRouter.patch("/profile", userAuth, isCraftsman, updateProfile);

export default craftsmanRouter;
