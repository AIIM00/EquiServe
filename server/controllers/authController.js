import prisma from "../src/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["CUSTOMER", "CRAFTSMAN"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: true, message: "User already exists" });
    } else {
      // Create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const data = {
        name,
        email,
        password: hashedPassword,
        role,
      };

      if (role === "CRAFTSMAN") {
        data.craftsman = {
          create: {},
        };
      }

      const newUser = await prisma.user.create({ data });

      const token = jwt.sign(
        //payload, secret, options)
        { userId: newUser.id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "3h" },
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 3600 * 1000, //3 hours
      });

      //Send an email to the user for verification
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: newUser.email,
        subject: "Welcome to EquiServe! Please verify your email",
        text: `Hi ${newUser.name},

Thank you for registering on EquiServe.
Please request the verification OTP and enter it in the app to verify your email.

Best regards,
The EquiServe Team`,
      };
      await transporter.sendMail(mailOptions);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: newUser,
      });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    } else {
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password" });
      } else {
        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "3h" },
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3 * 3600 * 1000, // 3 hours
        });
        res.json({
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout function

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Send OTP for email verification
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.isAccountVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
      // Store the OTP in the database with an expiration time (e.g., 10 minutes)
      await prisma.user.update({
        where: { id: userId },
        data: {
          verifyOtp: otp,
          verifyOtpExpireAt: new Date(Date.now() + 10 * 60 * 1000), // Set expiry time to 10 minutes
        },
      });
      // Send the OTP to the user's email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Your OTP for email verification",
        text: `Hi ${user.name},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nBest regards,\nThe EquiServe Team`,
      };
      await transporter.sendMail(mailOptions);
      res.json({ message: "OTP sent to email successfully" });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Verify OTP for email verification
export const verifyEmail = async (req, res) => {
  try {
    const { enteredOtp } = req.body;
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (
      !user ||
      user.verifyOtp !== enteredOtp ||
      !user.verifyOtpExpireAt ||
      user.verifyOtpExpireAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isAccountVerified: true,
          verifyOtp: null,
          verifyOtpExpireAt: null,
        },
      });
      res.json({ message: "Email verified successfully" });
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Check if user is authenticated
//what will happpen here so before this controller function we will execute the middleware
//if the middleware will be executed after that this authentication controller function will be excecuted
//it will return this response true whenever the user is authenticated
export const checkAuth = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "User is authenticated",
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Reset password using OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  } else {
    try {
      console.log("Email received for password reset:", email); // Debugging line to check if email is received
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist" });
      } else {
        const passwordResetOtp = Math.floor(
          100000 + Math.random() * 900000,
        ).toString(); // Generate a 6-digit OTP
        await prisma.user.update({
          where: { email },
          data: {
            resetOtp: passwordResetOtp,
            resetOtpExpireAt: new Date(Date.now() + 10 * 60 * 1000), // Set expiry time to 10 minutes
          },
        });
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: "Your OTP for password reset",
          text: `Hi,\n\nYour OTP for password reset is: ${passwordResetOtp}\n\nThis OTP will expire in 10 minutes.\n\nBest regards,\nThe EquiServe Team`,
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP sent to email successfully" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

//Update password after verifying OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, enteredOtp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.resetOtp !== enteredOtp ||
      !user.resetOtpExpireAt ||
      user.resetOtpExpireAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          resetOtp: null,
          resetOtpExpireAt: null,
        },
      });
      res.json({ message: "Password updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
