// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        image: {
            type: String,
        },
        published: {
            type: Boolean,
            default: true,
        },
        author: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
    },
    { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
