import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import axios from "axios";
import jwt from "jsonwebtoken";
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // domain: "https://vasanwears-production.up.railway.app",
    path: "/",
}
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAdminAccessToken();
        // const refreshToken = await user.generateRefreshToken();
        const hashedRefresh = await user.generateAdminRefreshToken();
        // const hashedRefresh = await bcryptjs.hash(refreshToken, 10);
        user.refreshToken = hashedRefresh;
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false })
        return { accessToken, hashedRefresh }
    } catch (error) {
        throw new Error("Error generating tokens: " + error.message);
    }
}

const adminLoginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Email and password are required.", null));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, "User not found.", null));
    }


    // Compare password
    const isPasswordMatch = await user.isPasswordMatched(password);

    if (!isPasswordMatch) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Invalid credentials.", null));
    }
    if (user.role !== "admin") {
        return res
            .status(403)
            .json(new ApiResponse(403, "Access denied. Not an admin user.", null));
    }
    // Generate tokens
    const { accessToken, hashedRefresh } =
        await generateAccessAndRefreshToken(user._id);


    const loginUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("adminAccessToken", accessToken, options)
        .cookie("adminRefreshToken", hashedRefresh, options)
        .json(
            new ApiResponse(200, "Login Successful", {
                user: loginUser,
                adminAccessToken: accessToken,
                adminRefreshToken: hashedRefresh
            })
        );
});

const logoutHandler = asyncHandler(async (req, res) => {
    const adminRefreshToken = req.cookies.adminRefreshToken;

    if (adminRefreshToken) {
        const decoded = jwt.decode(adminRefreshToken);
        if (decoded?._id) {
            const user = await User.findById(decoded._id);
            if (user) {
                user.refreshToken = null;
                await user.save({ validateBeforeSave: false });
            }
        }
    }

    return res
        .clearCookie("adminAccessToken", options)
        .clearCookie("adminRefreshToken", options)
        .status(200)
        .json(new ApiResponse(200, "Logout Successful", null));
});

const currentUser = asyncHandler(async (req, res) => {
    const userId = req?.adminuser._id;
    if (!userId) {
        return res
            .status(400)
            .json(new ApiResponse(401, "User is not found.", null));
    }
    const user = await User.findById(userId).select("-password -refreshToken");
    return res
        .status(200)
        .json(new ApiResponse(200, "Current User Fetched Successfully", user));
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.adminRefreshToken || req.body.adminRefreshToken;

    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Refresh token missing", null));
    }

    let decoded;
    try {
        decoded = jwt.verify(
            incomingRefreshToken,
            process.env.ADMIN_REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Refresh token expired", null));
    }

    const user = await User.findById(decoded._id);

    if (!user || !user.refreshToken) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Invalid refresh token", null));
    }

    // ✅ SIMPLE STRING MATCH (NO BCRYPT)
    if (incomingRefreshToken !== user.refreshToken) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Refresh token mismatch", null));
    }

    const accessToken = user.generateAccessToken();
    console.log("Access token worked");

    return res
        .cookie("adminAccessToken", accessToken, options)
        .status(200)
        .json(
            new ApiResponse(200, "Access token refreshed", {
                adminAccessToken: accessToken,
            })
        );
});


export { adminLoginUser, currentUser, logoutHandler, generateAccessAndRefreshToken, refreshAccessToken };