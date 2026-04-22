import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "../routes/authRoutes.js";
import userRouter from "../routes/userRoutes.js";
import adminRouter from "../routes/adminRoutes.js";
import craftsmanRouter from "../routes/craftsmanRoutes.js";
import { startTimeoutCron } from "../services/taskTimeoutCron.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
// Middleware to parse cookies
app.use(cookieParser());

//API Endpoints

app.get("/", (req, res) => {
  res.send("EquiServe API is running");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/craftsman", craftsmanRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startTimeoutCron();
});
