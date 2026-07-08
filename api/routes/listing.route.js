import express from "express";
import {
  approveListing,
  createListing,
  deleteListing,
  getAdminPendingListings,
  getListing,
  getPublicListing,
  getUserListings,
  rejectListing,
  searchListings,
  updateListing,
  uploadListingImages,
} from "../controllers/listing.controller.js";
import { uploadListingImages as uploadListingImagesMiddleware } from "../middleware/multer.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyUser, createListing);
router.get("/mine", verifyUser, getUserListings);
router.get("/admin/pending", verifyUser, verifyAdmin, getAdminPendingListings);
router.patch("/admin/:id/approve", verifyUser, verifyAdmin, approveListing);
router.patch("/admin/:id/reject", verifyUser, verifyAdmin, rejectListing);
router.get("/search", searchListings);
router.get("/public/:id", getPublicListing);
router.post(
  "/upload-images",
  verifyUser,
  uploadListingImagesMiddleware.array("images", 7),
  uploadListingImages
);
router.get("/:id", verifyUser, getListing);
router.put("/:id", verifyUser, updateListing);
router.delete("/:id", verifyUser, deleteListing);

export default router;
