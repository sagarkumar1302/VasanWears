import mongoose from "mongoose";
import { type } from "os";

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        messageType: {
            type: String,
            enum: ["text", "image", "video", "file"],
            default: "text",
        },

        text: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        seen: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

export const Message = mongoose.model("Message", MessageSchema);
