import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";

export const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate("listingRef", "name address mainImage status")
      .populate("userRef", "username email avatar")
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return next(errorHandler(404, "Notification not found"));
    }

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.status(200).json("Notifications marked as read");
  } catch (error) {
    next(error);
  }
};
