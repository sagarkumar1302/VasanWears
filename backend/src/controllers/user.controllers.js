import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { OAuth2Client } from "google-auth-library";
import bcryptjs from "bcryptjs";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const options = {
    httpOnly: true,
    secure: true
}
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        const hashedRefresh = await bcryptjs.hash(refreshToken, 10);
        user.refreshToken = hashedRefresh;
        await user.save({ validateBeforeSave: false })
        return { accessToken, hashedRefresh }
    } catch (error) {
        throw new Error("Error generating tokens: " + error.message);
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    console.log("Fullname", fullName);
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
    const avatarLocalPath = req.file?.path;
    console.log("res files ", req.file);

    if (!avatarLocalPath) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Avatar local path is not found.", null));
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if (!avatar) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Avatar from cloudinary is not found.", null));
    }
    console.log("Avatar ", avatar);
    const user = await User.create({
        fullName,
        email,
        password,
        avatar: avatar.url,
    });
    // console.log("User ", user);

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
    if (user.authType === "google") {
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
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.lastLogin = Date.now();
    await user.save();

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
    const { idToken } = req.body;
    console.log("Id Token ", idToken);

    if (!idToken) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Google ID token is required.", null));
    }

    // 1️⃣ Verify the token using Google
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("Ticket ", ticket);
    const payload = ticket.getPayload();
    console.log("Payload ", payload);

    const { email, name, picture, sub: googleId } = payload;

    console.log("Payload ", payload);
    console.log("Google Id ", googleId);
    // 2️⃣ Check if user exists
    let user = await User.findOne({ email });
    console.log("User existed ", user);

    // 3️⃣ If user does NOT exist → Register automatically
    if (!user) {
        try {
            user = await User.create({
                fullName: name,
                email,
                avatar: picture,
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
    console.log("Created User ", user);

    // 4️⃣ Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log("Refresh and access ", accessToken, refreshToken);

    user.refreshToken = refreshToken;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

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
const currentUser = asyncHandler(async (req, res) => {
    const userId = req?.user._id;
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
export { registerUser, loginUser, currentUser, userProfile, googleLogin };