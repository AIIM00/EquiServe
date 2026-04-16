import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  checkAuth,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController.js";

//Auth Endpoints
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", userAuth, logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, checkAuth);

authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
