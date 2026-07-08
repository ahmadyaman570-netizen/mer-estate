import multer from "multer";
import { errorHandler } from "../utils/error.js";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(errorHandler(400, "Only JPEG, PNG, and WebP images are allowed"));
    }

    cb(null, true);
  },
});

export const uploadListingImages = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024,
    files: 7,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(errorHandler(400, "Only JPEG, PNG, and WebP images are allowed"));
    }

    cb(null, true);
  },
});
