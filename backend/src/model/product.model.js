import mongoose from "mongoose";

/**
 * VARIANT SUB-SCHEMA
 */

const productVariantSchema = new mongoose.Schema(
  {
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: true,
    },

    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      default: null, // 👈 null = ANY SIZE
    },
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
      required: true,
      min: 0,
    },

    featuredImage: String,
    gallery: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],

  },
  { _id: true }
);

/**
 * PRODUCT SCHEMA (VARIANT ONLY)
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
    colors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
      },
    ],

    sizes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
      },
    ],
    description: {
      type: String,
      required: true,
    },

    variants: {
      type: [productVariantSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one variant is required",
      },
    },

    featuredImage: {
      type: String,
      required: true,
    },
    hoverImage: {
      type: String,
      required: true,
    },
    desginImage: [
      {
        url: {
          type: String,
        },
        side: {
          type: String,
          enum: ["front", "back", "left", "right"],
          required: true,
        },
      },
    ],

    gallery: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],


    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
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
