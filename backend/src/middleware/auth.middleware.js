import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
const verifyJwt = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Access token missing", null));
    }

    try {
        const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedUser._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res
                .status(401)
                .json(new ApiResponse(401, "Invalid access token", null));
        }

        req.user = user;
        next();
    } catch (error) {
        // 👇 IMPORTANT: explicit expired message
        return res
            .status(401)
            .json(new ApiResponse(401, "ACCESS_TOKEN_EXPIRED", null));
    }
});

export default verifyJwt;