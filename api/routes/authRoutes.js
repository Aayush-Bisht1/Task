import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { protectedRoute } from "../middleware/auth.js";

const signtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload a profile image",
      });
    }
    const { profileImage } = req.files;
    const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid profile image",
      });
    }
    const { username, email, password, location, interest, age, gender } =
      req.body;
    if (
      !username ||
      !email ||
      !password ||
      !location ||
      !interest ||
      !age ||
      !gender
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profileImage.tempFilePath, {
      folder: "profileImages"
    });
    const registeredUser = await User.findOne({ email });
    if (registeredUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const user = await User.create({
      username,
      email,
      password,
      location,
      interest,
      age,
      gender,
      profileImage: uploadResponse.secure_url,
    });
    const token = signtoken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const isValid = await user.matchPassword(password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = signtoken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json({
      success: true,
      token,
      message: "User logged in successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/logout", protectedRoute, async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

router.get("/user", protectedRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends')
    .populate('friendRequest.from')
    .populate('sentFriendRequests');;
    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found",
      })
    }
    const sanitizedUser = {
      ...user.toObject(),
      sentFriendRequests: user.sentFriendRequests.map(request => 
          request._id ? request._id.toString() : request.toString()
      )
  };
    res.status(200).json({
      success: true,
      user: sanitizedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

export default router;
