import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    images: [
      {
        type: String, // S3 image URL
      },
    ],

    isApproved: {
      type: Boolean,
      default: false, // you can make this false if admin approval needed
    },
  },
  { timestamps: true }
);

/**
 * Prevent same user from rating same product multiple times
 */
ratingSchema.index({ product: 1, ratedBy: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", ratingSchema);
