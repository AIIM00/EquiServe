import express from "express";
import userAuth from "../middleware/userAuth.js";
import { isAdmin, isSuperAdmin, inviteCheck } from "../middleware/adminAuth.js";
import {
  adminInfo,
  addAdmin,
  getAllCustomers,
  getUserById,
  deleteUserById,
  acceptAdminInvite,
  getAllCraftsmen,
  getCraftsmanApplication,
  getCraftsmenCountByCategory,
  getAllReviews,
  inProgressTasks,
  createWarning,
  getFlaggedCraftsmen,
  removeWarning,
  restoreCraftsman,
  updateApplicationStatus,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post("/add-admin", userAuth, isSuperAdmin, addAdmin);
adminRouter.post(
  "/add-admin/accept-invite/:token",
  inviteCheck,
  acceptAdminInvite,
);

adminRouter.get("/info", userAuth, isAdmin, adminInfo);
adminRouter.get("/customers", userAuth, isAdmin, getAllCustomers);
adminRouter.get("/craftsmen", userAuth, isAdmin, getAllCraftsmen);
adminRouter.get(
  "/craftsmen/applications",
  userAuth,
  isAdmin,
  getCraftsmanApplication,
);
adminRouter.patch(
  "/craftsmen/applications/:userId/status",
  userAuth,
  isAdmin,
  updateApplicationStatus,
);
adminRouter.get(
  "/craftsmen/category/count",
  userAuth,
  isAdmin,
  getCraftsmenCountByCategory,
);
adminRouter.patch(
  "/craftsmen/restore/:userId",
  userAuth,
  isAdmin,
  restoreCraftsman,
);

adminRouter.get("/reviews", userAuth, isAdmin, getAllReviews);
adminRouter.get("/tasks/in-progress", userAuth, isAdmin, inProgressTasks);

adminRouter.get("/data/:id", userAuth, isAdmin, getUserById);
adminRouter.delete("/delete/:id", userAuth, isAdmin, deleteUserById);

adminRouter.post("/warnings/:craftsmanId", userAuth, isAdmin, createWarning);
adminRouter.delete("/warnings/:warningId", userAuth, isAdmin, removeWarning);
adminRouter.get(
  "/warnings/flagged-craftsmen",
  userAuth,
  isAdmin,
  getFlaggedCraftsmen,
);

export default adminRouter;
