import mongoose from "mongoose";

/**
 * PRODUCT VARIANT SUB-SCHEMA (embedded)
 */
const productVariantSchema = new mongoose.Schema(
  {
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
    },
    stock: {
      type: Number,
      default: 0,
    },
    featuredImage: {
      type: String,
    },
    gallery: [String],
  },
  { _id: true }
);

/**
 * PRODUCT SCHEMA
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    productType: {
      type: String,
      enum: ["simple", "variant"],
      default: "simple",
    },

    regularPrice: {
      type: Number,
      required: function () {
        return this.productType === "simple";
      },
    },

    salePrice: {
      type: Number,
    },

    stock: {
      type: Number,
      required: function () {
        return this.productType === "simple";
      },
    },

    variants: [productVariantSchema], // ✅ Embedded variants

    featuredImage: {
      type: String,
      required: true,
    },

    gallery: [String],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    status: {
      type: String,
      enum: ["published", "unpublished"],
      default: "published",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

  },

  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
