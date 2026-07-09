import express from "express";
import {
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/admin", verifyUser, verifyAdmin, getAdminNotifications);
router.patch("/admin/read-all", verifyUser, verifyAdmin, markAllNotificationsRead);
router.patch("/admin/:id/read", verifyUser, verifyAdmin, markNotificationRead);

export default router;
