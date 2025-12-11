import mongoose from "mongoose";
const StatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    typeOfStory: {
        type: String
    },
    contentUrl: {
        type: String
    },
    caption: {
        type: String,
        trim: true,
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
})
export const Status = mongoose.model("Status", StatusSchema)