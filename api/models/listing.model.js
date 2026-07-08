import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000000,
    },
    discountPrice: {
      type: Number,
      min: 0,
      max: 1000000000,
      default: 0,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    kitchens: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
      default: 1,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["real-estate", "residential"],
      default: "residential",
    },
    categories: {
      type: [String],
      enum: ["residential", "commercial"],
      default: ["residential"],
      validate: {
        validator: (categories) =>
          categories.length > 0 && categories.length <= 2,
        message: "At least one category is required",
      },
    },
    type: {
      type: String,
      enum: ["sale", "rent"],
      default: "sale",
    },
    offerTypes: {
      type: [String],
      enum: ["sale", "rent"],
      default: ["sale"],
      validate: {
        validator: (offerTypes) => offerTypes.length > 0 && offerTypes.length <= 2,
        message: "At least one offer type is required",
      },
    },
    mainImage: {
      type: String,
      trim: true,
      required: true,
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 6,
        message: "Slider images cannot be more than 6",
      },
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
