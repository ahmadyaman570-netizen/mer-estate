import { errorHandler } from "./error.js";

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cloudinaryImageRegex =
  /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/.+/;

export const sanitizeUserPayload = (payload, options = {}) => {
  const sanitized = {};

  if (payload.username !== undefined) {
    const username = String(payload.username).trim();
    if (!usernameRegex.test(username)) {
      throw errorHandler(
        400,
        "Username must be 3-30 characters and contain only letters, numbers, or underscores"
      );
    }
    sanitized.username = username;
  } else if (options.required) {
    throw errorHandler(400, "Username is required");
  }

  if (payload.email !== undefined) {
    const email = String(payload.email).trim().toLowerCase();
    if (!emailRegex.test(email) || email.length > 254) {
      throw errorHandler(400, "Valid email is required");
    }
    sanitized.email = email;
  } else if (options.required) {
    throw errorHandler(400, "Email is required");
  }

  if (payload.password !== undefined && String(payload.password).trim() !== "") {
    const password = String(payload.password);
    if (password.length < 8 || password.length > 72) {
      throw errorHandler(400, "Password must be between 8 and 72 characters");
    }
    sanitized.password = password;
  } else if (options.required) {
    throw errorHandler(400, "Password is required");
  }

  if (payload.avatar !== undefined) {
    const avatar = String(payload.avatar).trim();
    if (!cloudinaryImageRegex.test(avatar)) {
      throw errorHandler(400, "Avatar must be a Cloudinary image URL");
    }
    sanitized.avatar = avatar;
  }

  return sanitized;
};

export const sanitizeLoginPayload = (payload) => {
  const email = String(payload.email || "")
    .trim()
    .toLowerCase();
  const password = String(payload.password || "");

  if (!emailRegex.test(email) || email.length > 254 || !password) {
    throw errorHandler(400, "Email and password are required");
  }

  return { email, password };
};

export const sanitizeGooglePayload = (payload) => {
  const email = String(payload.email || "")
    .trim()
    .toLowerCase();
  const name = String(payload.name || "").trim();
  const photoURL = String(payload.photoURL || "").trim();

  if (!emailRegex.test(email) || email.length > 254) {
    throw errorHandler(400, "Valid email is required");
  }

  if (!name || name.length > 80) {
    throw errorHandler(400, "Valid name is required");
  }

  if (photoURL && !/^https:\/\/.+/.test(photoURL)) {
    throw errorHandler(400, "Valid photo URL is required");
  }

  return { email, name, photoURL };
};
