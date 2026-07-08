import User from "../models/user.model.js";
import { errorHandler } from "./error.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("isAdmin");

    if (!user?.isAdmin) {
      return next(errorHandler(403, "Admin access is required"));
    }

    next();
  } catch (error) {
    next(error);
  }
};
