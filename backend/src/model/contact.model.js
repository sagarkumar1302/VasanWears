import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["contact", "feedback"],
            default: "contact",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        isReplied: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const ContactMessage = mongoose.model(
    "ContactMessage",
    contactSchema
);
