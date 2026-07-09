import bcrypt from "bcryptjs";
import Listing from "../models/listing.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { authCookieOptions } from "../utils/authCookie.js";
import { uploadImageBuffer } from "../utils/cloudinary.js";
import { sanitizeUserPayload } from "../utils/validation.js";

export const test = (req, res) => {
  res.json({ message: "User route is working!" });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only update your own account"));
  }

  try {
    const updateFields = sanitizeUserPayload(req.body);

    if (Object.keys(updateFields).length === 0) {
      return next(errorHandler(400, "No valid fields provided"));
    }

    if (updateFields.password) {
      updateFields.password = bcrypt.hashSync(updateFields.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...otherDetails } = updatedUser._doc;
    res.status(200).json(otherDetails);
  } catch (error) {
    next(error);
  }
};

export const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler(400, "Image file is required"));
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return next(errorHandler(500, "Cloudinary is not configured"));
    }

    const result = await uploadImageBuffer(req.file.buffer);
    res.status(200).json({ avatar: result.secure_url });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account"));
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res
      .clearCookie("access_token", authCookieOptions)
      .status(200)
      .json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return next(errorHandler(400, "Admin cannot delete their own account"));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    await Listing.deleteMany({ userRef: req.params.id });
    await Notification.deleteMany({ userRef: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json("User and their estates have been deleted");
  } catch (error) {
    next(error);
  }
};
