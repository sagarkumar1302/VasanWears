import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { io, userSocketMap } from "../index.js";
const getUserForSidebar = asyncHandler(async (req, res) => {
    const userId = req?.user._id;

    const filteredUser = await User.find({
        _id: { $ne: userId }
    }).select("-password -refreshToken");

    if (!filteredUser) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Filtered User is not found.", null));
    }

    const unseenMessages = {};

    // Count unseen messages for each user
    const promises = filteredUser.map(async (user) => {
        const count = await Message.countDocuments({
            senderId: user._id,
            receiverId: userId,
            seen: false
        });

        unseenMessages[user._id] = count; // store even if count = 0
    });

    await Promise.all(promises);     // ⬅ FIXED

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Sidebar Users", {
                users: filteredUser,
                unseenMessages
            })
        );
});

const getMessageForSelectedUser = asyncHandler(async (req, res) => {
    const { id: selectedUserId } = req.params;
    const userId = req?.user._id;
    await Message.updateMany({ senderId: selectedUserId, receiverId: userId }, { $set: { seen: true } })
    const message = await Message.find({
        $or: [
            { senderId: selectedUserId, receiverId: userId },
            { receiverId: selectedUserId, senderId: userId }
        ]
    }).sort({ createdAt: 1 });
    if (!message) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Message not found.", null));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Selected User Message", message));
})
const markMessageSeen = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true })
    return res
        .status(200)
        .json(new ApiResponse(200, "Message Marked as Seen", null));
})
const sendMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req?.user._id;

    if (!text && !req.file) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Message text or image is required.", null));
    }

    let imageUrl = null;

    // If an image is uploaded, upload it to Cloudinary
    if (req.file) {
        const uploaded = await uploadCloudinary(req.file.path);
        if (!uploaded || !uploaded.url) {
            return res
                .status(400)
                .json(new ApiResponse(400, "Failed to upload image to Cloudinary.", null));
        }
        imageUrl = uploaded.url;
    }

    // Create the message
    const message = await Message.create({
        senderId,
        receiverId,
        messageType: imageUrl ? "image" : "text",
        text: text || "",
        image: imageUrl || null,
    });

    if (!message) {
        return res
            .status(500)
            .json(new ApiResponse(500, "Failed to send message.", null));
    }
    // Emit new message to reciver side
    const recieverSocketId = userSocketMap[receiverId];
    if (recieverSocketId) {
        io.to(recieverSocketId).emit("newMessage", message)
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Message sent successfully.", message));
});
export { getUserForSidebar, getMessageForSelectedUser, markMessageSeen, sendMessage }