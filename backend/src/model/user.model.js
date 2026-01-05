import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true,
    },
    avatar: {
        type: String,
    },
    password: {
        type: String,
        required: false, // MUST BE OPTIONAL for Google login
    },
    refreshToken: {
        type: String,
    },
    gender: {
        type: String, enum: ["male", "female", "other"], default: "male",
    },
    googleId: { type: String },
    authType: { type: String, enum: ["manual", "google"], default: "manual" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
    phoneNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    cartIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cart" }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    points: {
        type: Number,
        default: 0,
    },
    wishListIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WishList" }],
}, { timestamps: true });

userSchema.pre("save", async function () {
    // Skip hashing if password not modified
    if (!this.isModified("password")) return;

    // Skip hashing for Google users (no password)
    if (!this.password) return;

    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});



userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, fullName: this.fullName, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
        // { expiresIn: "5s" }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );
};
userSchema.methods.generateAdminAccessToken = function () {
    return jwt.sign(
        { _id: this._id, fullName: this.fullName, email: this.email },
        process.env.ADMIN_ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN }
    );
};

userSchema.methods.generateAdminRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.ADMIN_REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN }
    );
};

export const User = mongoose.model("User", userSchema);
