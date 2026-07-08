import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import { authCookieOptions, createAuthToken } from "../utils/authCookie.js";
import {
  sanitizeGooglePayload,
  sanitizeLoginPayload,
  sanitizeUserPayload,
} from "../utils/validation.js";

const getAdminEmails = () =>
  [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const isAdminEmail = (email) => getAdminEmails().includes(email.toLowerCase());

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = sanitizeUserPayload(req.body, {
      required: true,
    });
    const hashedPassword = bcrypt.hashSync(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdminEmail(email),
    });

    await newUser.save();
    res.status(201).json("User has been created successfully");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = sanitizeLoginPayload(req.body);
    const validUser = await User.findOne({ email }).select("+password");
    if (!validUser) {
      return next(errorHandler(401, "Invalid email or password"));
    }
    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid email or password"));
    }
    if (isAdminEmail(validUser.email) && !validUser.isAdmin) {
      validUser.isAdmin = true;
      await validUser.save();
    }
    const token = createAuthToken(validUser._id);
    const { password: pass, ...otherDetails } = validUser._doc;
    res
      .cookie("access_token", token, authCookieOptions)
      .status(200)
      .json(otherDetails);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { email, name, photoURL } = sanitizeGooglePayload(req.body);
    const user = await User.findOne({ email });
    if (user) {
      if (isAdminEmail(user.email) && !user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
      const token = createAuthToken(user._id);
      const { password, ...otherDetails } = user._doc;
      res
        .cookie("access_token", token, authCookieOptions)
        .status(200)
        .json(otherDetails);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
      const baseUsername =
        name.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 24) ||
        "user";
      const newUser = new User({
        username: baseUsername + Math.random().toString(36).slice(-4),
        email,
        password: hashedPassword,
        avatar: photoURL,
        isAdmin: isAdminEmail(email),
      });
      await newUser.save();
      const token = createAuthToken(newUser._id);
      const { password, ...otherDetails } = newUser._doc;
      res
        .cookie("access_token", token, authCookieOptions)
        .status(200)
        .json(otherDetails);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res
    .clearCookie("access_token", authCookieOptions)
    .status(200)
    .json("User has been signed out");
};
