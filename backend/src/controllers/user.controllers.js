import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { uploadToS3 } from "../utils/uploadToS3.js";
const isProd = process.env.NODE_ENV === "production";

const options = {
    httpOnly: true,
    secure: isProd,                     // ✅ true only in production
    sameSite: isProd ? "none" : "lax",   // ✅ Safari-safe
    ...(isProd && { domain: ".vasanwears.in" }),
    path: "/",
};
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        // const refreshToken = await user.generateRefreshToken();
        const refreshToken = await user.generateRefreshToken();
        // const hashedRefresh = await bcryptjs.hash(refreshToken, 10);
        user.refreshToken = refreshToken;
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new Error("Error generating tokens: " + error.message);
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if ([fullName, email, password].some((field) => !field?.trim())) {
        return res
            .status(400)
            .json(new ApiResponse(400, "All Fields are mandatory.", null));
    }
    if (!emailRegex.test(email)) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Email is not valid.", null));
    }
    const existedUser = await User.findOne({
        $or: [{ email }],
    });
    if (existedUser) {
        return res
            .status(400)
            .json(new ApiResponse(400, "User already existed.", null));
    }
    let imageUrl = null;

    if (req.file) {
        imageUrl = await uploadToS3(req.file, "usersAvatars");
    }


    const user = await User.create({
        fullName,
        email,
        password,
        avatar: imageUrl,
    });


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        return res
            .status(400)
            .json(new ApiResponse(400, "User is not created.", null));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "User created successfully", createdUser));
});
const loginUser = asyncHandler(async (req, res) => {
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

    // Google login users should not use password login
    if (user.authType === "google" && !user.password) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Please login using Google.", null));
    }

    // Compare password
    const isPasswordMatch = await user.isPasswordMatched(password);

    if (!isPasswordMatch) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Invalid credentials.", null));
    }

    // Generate tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);


    const loginUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "Login Successful", {
                user: loginUser,
                accessToken,
                refreshToken
            })
        );
});
const googleLogin = asyncHandler(async (req, res) => {
    const { access_token } = req.body;


    if (!access_token) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Google ID token is required.", null));
    }


    const googleRes = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );


    const { email, name, picture, sub: googleId } = googleRes.data;

    // 2️⃣ Check if user exists
    let user = await User.findOne({ email });


    // 3️⃣ If user does NOT exist → Register automatically
    if (!user) {
        try {
            user = await User.create({
                fullName: name,
                email,
                googleId,
                authType: "google",
                password: null,
                // username: `${name.replace(/\s+/g, '').toLowerCase()}_${Date.now()}`,
            });
        } catch (err) {
            console.error("Error creating user: ", err);
            return res.status(500).json(new ApiResponse(500, "User creation failed", err.message));
        }
    }

    // 4️⃣ Generate tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);


    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // 5️⃣ Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "Google Login Successful", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        );
});
const logoutHandler = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        const decoded = jwt.decode(refreshToken);
        if (decoded?._id) {
            const user = await User.findById(decoded._id);
            if (user) {
                user.refreshToken = null;
                await user.save({ validateBeforeSave: false });
            }
        }
    }

    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .status(200)
        .json(new ApiResponse(200, "Logout Successful", null));
});

const currentUser = asyncHandler(async (req, res) => {
    const userId = req?.user._id;
    if (!userId) {
        return res
            .status(400)
            .json(new ApiResponse(401, "User is not found.", null));
    }
    const user = await User.findById(userId).select("-password -refreshToken").lean();
    return res
        .status(200)
        .json(new ApiResponse(200, "Current User Fetched Successfully", user));
})
const userProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -refreshToken");
    if (!user) {
        return res
            .status(404)
            .json(new ApiResponse(404, "User not found.", null));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "User Found Successfully", user));
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;
    console.log("Refresh Token Worked.");
    
    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Refresh token missing", null));
    }

    let decoded;
    try {
        decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
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


    return res
        .cookie("accessToken", accessToken, options)
        .status(200)
        .json(
            new ApiResponse(200, "Access token refreshed", {
                accessToken,
            })
        );
});



export { registerUser, loginUser, currentUser, userProfile, googleLogin, logoutHandler, generateAccessAndRefreshToken, refreshAccessToken };