import mongoose from "mongoose";
const designSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    images: {
      front: String,
      back: String,
      frontDesignArea: String,
      backDesignArea: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sellPrice: {
      type: Number,
      required: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Design = mongoose.model(
  "Design",
  designSchema
);