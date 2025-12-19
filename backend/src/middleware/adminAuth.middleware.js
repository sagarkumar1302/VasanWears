import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
const adminVerifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.adminAccessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res
                .status(401)
                .json(new ApiResponse(401, "Token is not found.", null));
        }
        const decodedUser = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedUser._id).select("-password -refreshToken");
        if (!user) {
            return res
                .status(401)
                .json(new ApiResponse(401, "Token is expired. Invalid Token", null));
        }
        req.user = user;
        next();
    } catch (error) {
        return res
            .status(401)
            .json(new ApiResponse(401, error.message || "Invalid access token", null));
    }
})
export default adminVerifyJwt;