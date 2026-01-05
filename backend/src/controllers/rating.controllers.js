import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Rating } from "../model/rating.model.js";
import { Order } from "../model/order.model.js";
import { Product } from "../model/product.model.js";
import mongoose from "mongoose";

/**
 * Helper: Check if user has purchased a product
 */
const hasUserPurchasedProduct = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    orderStatus: "DELIVERED", // Only count delivered orders
    "items.product": productId,
    "items.itemType": "catalog",
  });

  return !!order;
};

/**
 * Helper: Update product's average rating
 */
const updateProductRating = async (productId) => {
  const stats = await Rating.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      ratingCount: stats[0].ratingCount,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      ratingCount: 0,
    });
  }
};

/**
 * @route   POST /api/ratings
 * @desc    Create a new rating/review
 * @access  Private (User must be authenticated)
 */
export const createRating = asyncHandler(async (req, res) => {
  const { product, rating, title, comment, media } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!product || !rating) {
    throw new ApiError(400, "Product ID and rating are required");
  }

  // Validate rating value
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user has purchased this product
  const hasPurchased = await hasUserPurchasedProduct(userId, product);
  if (!hasPurchased) {
    throw new ApiError(
      403,
      "You can only review products you have purchased and received"
    );
  }

  // Check if user has already rated this product
  const existingRating = await Rating.findOne({
    product,
    ratedBy: userId,
  });

  if (existingRating) {
    throw new ApiError(400, "You have already rated this product");
  }

  // Create new rating
  const newRating = await Rating.create({
    product,
    ratedBy: userId,
    rating,
    title: title || "",
    comment: comment || "",
    media: media || [],
    isApproved: true, // Auto-approve or set to false for admin approval
  });

  // Populate user details
  await newRating.populate("ratedBy", "name email");

  // Update product rating stats
  await updateProductRating(product);

  res
    .status(201)
    .json(new ApiResponse(201, "Rating created successfully", newRating));
});

/**
 * @route   GET /api/ratings/product/:productId
 * @desc    Get all ratings for a specific product
 * @access  Public
 */
export const getProductRatings = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  // Get ratings with pagination
  const ratings = await Rating.find({
    product: productId,
    isApproved: true,
  })
    .populate("ratedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const totalRatings = await Rating.countDocuments({
    product: productId,
    isApproved: true,
  });

  // Get rating distribution
  const distribution = await Rating.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Ratings fetched successfully", {
      ratings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
        limit,
      },
      distribution,
    })
  );
});

/**
 * @route   GET /api/ratings/my-ratings
 * @desc    Get all ratings by current user
 * @access  Private
 */
export const getMyRatings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const ratings = await Rating.find({ ratedBy: userId })
    .populate("product", "title slug featuredImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalRatings = await Rating.countDocuments({ ratedBy: userId });

  res.status(200).json(
    new ApiResponse(200, "Your ratings fetched successfully", {
      ratings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
        limit,
      },
    })
  );
});

/**
 * @route   GET /api/ratings/:id
 * @desc    Get a single rating by ID
 * @access  Public
 */
export const getRatingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rating = await Rating.findById(id)
    .populate("ratedBy", "name email")
    .populate("product", "title slug featuredImage");

  if (!rating) {
    throw new ApiError(404, "Rating not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Rating fetched successfully", rating));
});

/**
 * @route   PUT /api/ratings/:id
 * @desc    Update a rating
 * @access  Private (Only rating owner)
 */
export const updateRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment, media } = req.body;
  const userId = req.user._id;

  // Find rating
  const existingRating = await Rating.findById(id);
  if (!existingRating) {
    throw new ApiError(404, "Rating not found");
  }

  // Check ownership
  if (existingRating.ratedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own ratings");
  }

  // Validate rating value if provided
  if (rating && (rating < 1 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Update fields
  if (rating !== undefined) existingRating.rating = rating;
  if (title !== undefined) existingRating.title = title;
  if (comment !== undefined) existingRating.comment = comment;
  if (media !== undefined) existingRating.media = media;

  // Save and populate
  await existingRating.save();
  await existingRating.populate("ratedBy", "name email");

  // Update product rating stats
  await updateProductRating(existingRating.product);

  res
    .status(200)
    .json(new ApiResponse(200, "Rating updated successfully", existingRating));
});


export const deleteRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find rating
  const rating = await Rating.findById(id);
  if (!rating) {
    throw new ApiError(404, "Rating not found");
  }

  // Check ownership
  if (rating.ratedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own ratings");
  }

  const productId = rating.product;

  // Delete rating
  await Rating.findByIdAndDelete(id);

  // Update product rating stats
  await updateProductRating(productId);

  res.status(200).json(new ApiResponse(200, "Rating deleted successfully", null));
});


export const checkRatingEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user has purchased
  const hasPurchased = await hasUserPurchasedProduct(userId, productId);

  // Check if user has already rated
  const existingRating = await Rating.findOne({
    product: productId,
    ratedBy: userId,
  });

  res.status(200).json(
    new ApiResponse(200, "Eligibility checked", {
      canRate: hasPurchased && !existingRating,
      hasPurchased,
      hasRated: !!existingRating,
      existingRating: existingRating || null,
    })
  );
});

/**
 * @route   PUT /api/ratings/:id/approve (Admin only)
 * @desc    Approve or reject a rating
 * @access  Private (Admin)
 */
export const toggleRatingApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  const rating = await Rating.findById(id);
  if (!rating) {
    throw new ApiError(404, "Rating not found");
  }

  rating.isApproved = isApproved;
  await rating.save();

  // Update product rating stats
  await updateProductRating(rating.product);

  res
    .status(200)
    .json(new ApiResponse(200, "Rating approval status updated", rating));
});
