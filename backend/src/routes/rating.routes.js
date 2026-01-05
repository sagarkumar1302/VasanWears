import express from "express";
import {
    createRating,
    getProductRatings,
    getMyRatings,
    getRatingById,
    updateRating,
    deleteRating,
    checkRatingEligibility,
    toggleRatingApproval,
} from "../controllers/rating.controllers.js";
import verifyJWT  from "../middleware/auth.middleware.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";


const router = express.Router();

// Public routes
router.get("/product/:productId", getProductRatings); // Get all ratings for a product
router.get("/single/:id", getRatingById); // Get single rating by ID

// Protected routes (require user authentication)
router.post("/", verifyJWT, createRating); // Create a new rating
router.get("/my-ratings", verifyJWT, getMyRatings); // Get user's own ratings
router.put("/:id", verifyJWT, updateRating); // Update user's rating
router.delete("/:id", verifyJWT, deleteRating); // Delete user's rating
router.get("/check/:productId", verifyJWT, checkRatingEligibility); // Check if user can rate

// Admin routes
router.put("/:id/approve", adminVerifyJwt, toggleRatingApproval); // Approve/reject rating

export default router;
