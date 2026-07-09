import Listing from "../models/listing.model.js";
import Notification from "../models/notification.model.js";
import sanitizeHtml from "sanitize-html";
import { notifyAdminNewListing } from "../utils/adminNotification.js";
import { uploadImageBuffer } from "../utils/cloudinary.js";
import { errorHandler } from "../utils/error.js";

const allowedCategories = ["residential", "commercial"];
const allowedOfferTypes = ["sale", "rent"];

const sanitizeStringArray = (value, allowedValues, fallback) => {
  const values = Array.isArray(value) ? value : value ? [value] : fallback;
  return [...new Set(values)]
    .map((item) => String(item).trim())
    .filter((item) => allowedValues.includes(item));
};

const sanitizeDescription = (value) => {
  const cleanDescription = sanitizeHtml(String(value || ""), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
    ],
    allowedAttributes: {},
    transformTags: {
      b: "strong",
      i: "em",
    },
  }).trim();

  const textOnlyLength = sanitizeHtml(cleanDescription, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim().length;

  if (textOnlyLength < 10 || textOnlyLength > 1000) {
    throw errorHandler(
      400,
      "Description must be between 10 and 1000 characters"
    );
  }

  return cleanDescription;
};

const sanitizeListingPayload = (payload) => {
  const categories = sanitizeStringArray(
    payload.categories || payload.category,
    allowedCategories,
    ["residential"]
  );
  const offerTypes = sanitizeStringArray(
    payload.offerTypes || payload.type,
    allowedOfferTypes,
    ["sale"]
  );

  const listing = {
    name: String(payload.name || "").trim(),
    description: sanitizeDescription(payload.description),
    address: String(payload.address || "").trim(),
    regularPrice: Number(payload.regularPrice),
    discountPrice: Number(payload.discountPrice || 0),
    bedrooms: Number(payload.bedrooms),
    bathrooms: Number(payload.bathrooms),
    kitchens: Number(payload.kitchens),
    parking: Boolean(payload.parking),
    furnished: Boolean(payload.furnished),
    category: categories.includes("commercial")
      ? "real-estate"
      : "residential",
    categories,
    type: offerTypes.includes("rent") ? "rent" : "sale",
    offerTypes,
    mainImage: String(payload.mainImage || "").trim(),
    imageUrls: Array.isArray(payload.imageUrls)
      ? payload.imageUrls.map((image) => String(image).trim()).filter(Boolean)
      : [],
  };

  if (listing.name.length < 3 || listing.name.length > 80) {
    throw errorHandler(400, "Estate name must be between 3 and 80 characters");
  }

  if (listing.address.length < 5 || listing.address.length > 200) {
    throw errorHandler(400, "Address must be between 5 and 200 characters");
  }

  if (
    !Number.isFinite(listing.regularPrice) ||
    listing.regularPrice < 1 ||
    listing.regularPrice > 1000000000
  ) {
    throw errorHandler(400, "Price must be a valid positive number");
  }

  if (
    listing.discountPrice &&
    (!Number.isFinite(listing.discountPrice) ||
      listing.discountPrice < 1 ||
      listing.discountPrice >= listing.regularPrice)
  ) {
    throw errorHandler(400, "Discount price must be lower than regular price");
  }

  if (
    !Number.isInteger(listing.bedrooms) ||
    listing.bedrooms < 0 ||
    listing.bedrooms > 50
  ) {
    throw errorHandler(400, "Bedrooms must be a valid number");
  }

  if (
    !Number.isInteger(listing.bathrooms) ||
    listing.bathrooms < 0 ||
    listing.bathrooms > 50
  ) {
    throw errorHandler(400, "Bathrooms must be a valid number");
  }

  if (
    !Number.isInteger(listing.kitchens) ||
    listing.kitchens < 0 ||
    listing.kitchens > 20
  ) {
    throw errorHandler(400, "Kitchens must be a valid number");
  }

  if (listing.categories.length === 0) {
    throw errorHandler(400, "At least one category is required");
  }

  if (listing.offerTypes.length === 0) {
    throw errorHandler(400, "At least one offer type is required");
  }

  if (!/^https:\/\/res\.cloudinary\.com\/.+/.test(listing.mainImage)) {
    throw errorHandler(400, "Main image is required");
  }

  if (listing.imageUrls.length > 6) {
    throw errorHandler(400, "Slider images cannot be more than 6");
  }

  if (
    listing.imageUrls.some(
      (imageUrl) => !/^https:\/\/res\.cloudinary\.com\/.+/.test(imageUrl)
    )
  ) {
    throw errorHandler(400, "Slider images must be valid Cloudinary URLs");
  }

  return listing;
};

export const createListing = async (req, res, next) => {
  try {
    const listingData = sanitizeListingPayload(req.body);
    const listing = await Listing.create({
      ...listingData,
      userRef: req.user.id,
      status: "pending",
      approvedAt: null,
      approvedBy: null,
      rejectionReason: "",
    });

    notifyAdminNewListing(listing).catch((error) => {
      console.error("Failed to send admin notification", error.message);
    });

    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const uploadListingImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(errorHandler(400, "At least one image is required"));
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return next(errorHandler(500, "Cloudinary is not configured"));
    }

    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadImageBuffer(file.buffer, "mern_estate/listings", [
          { width: 1200, height: 800, crop: "fill" },
          { quality: "auto", fetch_format: "auto" },
        ])
      )
    );

    res.status(200).json({
      imageUrls: uploads.map((upload) => upload.secure_url),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ userRef: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const searchListings = async (req, res, next) => {
  try {
    const {
      searchTerm = "",
      category,
      offerType,
      parking,
      furnished,
      minPrice,
      maxPrice,
      limit = 12,
      startIndex = 0,
      sort = "createdAt",
      order = "desc",
    } = req.query;
    const query = {};
    const searchText = String(searchTerm).trim();
    const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
    const parsedStartIndex = Math.max(Number(startIndex) || 0, 0);
    const sortField = ["createdAt", "regularPrice"].includes(sort)
      ? sort
      : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    query.status = "approved";

    if (searchText) {
      query.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { address: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
      ];
    }

    if (["residential", "commercial"].includes(category)) {
      query.categories = category;
    }

    if (["sale", "rent"].includes(offerType)) {
      query.offerTypes = offerType;
    }

    if (parking === "true") query.parking = true;
    if (furnished === "true") query.furnished = true;

    const priceQuery = {};
    if (Number(minPrice) > 0) priceQuery.$gte = Number(minPrice);
    if (Number(maxPrice) > 0) priceQuery.$lte = Number(maxPrice);
    if (Object.keys(priceQuery).length > 0) {
      query.regularPrice = priceQuery;
    }

    const listings = await Listing.find(query)
      .populate("userRef", "username avatar")
      .sort({ [sortField]: sortOrder })
      .skip(parsedStartIndex)
      .limit(parsedLimit);

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Estate not found"));
    }

    if (listing.userRef.toString() !== req.user.id) {
      return next(errorHandler(401, "You can only access your own estates"));
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getPublicListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("userRef", "username email avatar createdAt");

    if (!listing) {
      return next(errorHandler(404, "Estate not found"));
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Estate not found"));
    }

    if (listing.userRef.toString() !== req.user.id) {
      return next(errorHandler(401, "You can only update your own estates"));
    }

    const listingData = sanitizeListingPayload(req.body);
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...listingData,
          status: "pending",
          approvedAt: null,
          approvedBy: null,
          rejectionReason: "",
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getAdminPendingListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      $or: [{ status: "pending" }, { status: { $exists: false } }],
    })
      .populate("userRef", "username email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
          approvedBy: req.user.id,
          rejectionReason: "",
        },
      },
      { new: true, runValidators: true }
    ).populate("userRef", "username email avatar");

    if (!listing) {
      return next(errorHandler(404, "Estate not found"));
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const rejectListing = async (req, res, next) => {
  try {
    const reason = String(req.body?.reason || "").trim().slice(0, 300);
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "rejected",
          approvedAt: null,
          approvedBy: null,
          rejectionReason: reason || "Rejected by admin",
        },
      },
      { new: true, runValidators: true }
    ).populate("userRef", "username email avatar");

    if (!listing) {
      return next(errorHandler(404, "Estate not found"));
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Estate not found"));
    }

    if (listing.userRef.toString() !== req.user.id) {
      return next(errorHandler(401, "You can only delete your own estates"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    await Notification.deleteMany({ listingRef: req.params.id });
    res.status(200).json("Estate has been deleted");
  } catch (error) {
    next(error);
  }
};
