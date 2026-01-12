import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../model/coupon.model.js";

/**
 * CREATE COUPON
 */
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderValue,
    startDate,
    expiryDate,
    usageLimit,
    perUserLimit,
    applicableProducts,
    applicableCategories,
    isActive,
  } = req.body;

  // Validation
  if (!code || !discountType || !discountValue || !startDate || !expiryDate) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Required fields are missing"));
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return res
      .status(409)
      .json(new ApiResponse(409, "Coupon code already exists"));
  }

  // Validate dates
  if (new Date(startDate) >= new Date(expiryDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Start date must be before expiry date"));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderValue: minOrderValue || 0,
    startDate,
    expiryDate,
    usageLimit,
    perUserLimit: perUserLimit || 1,
    applicableProducts: applicableProducts || [],
    applicableCategories: applicableCategories || [],
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.adminuser?._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Coupon created successfully", coupon));
});

/**
 * GET ALL COUPONS
 */
const getAllCoupons = asyncHandler(async (req, res) => {
  const { isActive, discountType } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }
  if (discountType) {
    filter.discountType = discountType;
  }

  const coupons = await Coupon.find(filter)
    .populate("applicableProducts", "title slug")
    .populate("applicableCategories", "name slug")
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Coupons fetched successfully", coupons)
    );
});

/**
 * GET COUPON BY ID
 */
const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id)
    .populate("applicableProducts", "title slug featuredImage")
    .populate("applicableCategories", "name slug")
    .populate("createdBy", "name email");

  if (!coupon) {
    return res.status(404).json(new ApiResponse(404, "Coupon not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Coupon fetched successfully", coupon));
});

/**
 * VALIDATE AND APPLY COUPON
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue, products } = req.body;
  const userId = req.user?._id; // Get from authenticated user

  if (!code || !orderValue) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Coupon code and order value are required"));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    .populate("applicableProducts")
    .populate("applicableCategories");

  if (!coupon) {
    return res.status(404).json(new ApiResponse(404, "Invalid coupon code"));
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    return res.status(400).json(new ApiResponse(400, "Coupon is inactive"));
  }

  // Check dates
  const now = new Date();
  if (now < new Date(coupon.startDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Coupon is not yet valid"));
  }
  if (now > new Date(coupon.expiryDate)) {
    return res.status(400).json(new ApiResponse(400, "Coupon has expired"));
  }

  // Check minimum order value
  if (orderValue < coupon.minOrderValue) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          `Minimum order value of ₹${coupon.minOrderValue} required`
        )
      );
  }

  // Check global usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Coupon usage limit reached"));
  }

  // Check per user limit (CRITICAL: using authenticated user)
  if (userId) {
    const userUsageCount = coupon.usedBy.filter(
      (u) => u.user.toString() === userId.toString()
    ).length;
    if (userUsageCount >= coupon.perUserLimit) {
      return res
        .status(400)
        .json(new ApiResponse(400, `You have already used this coupon (limit: ${coupon.perUserLimit} times)`));
    }
  }

  // Check product/category applicability
  if (
    products &&
    (coupon.applicableProducts.length > 0 ||
      coupon.applicableCategories.length > 0)
  ) {
    const applicableProductIds = coupon.applicableProducts.map((p) =>
      p._id.toString()
    );
    const applicableCategoryIds = coupon.applicableCategories.map((c) =>
      c._id.toString()
    );

    const hasApplicableProduct = products.some(
      (p) =>
        applicableProductIds.includes(p.productId) ||
        applicableCategoryIds.includes(p.categoryId)
    );

    if (!hasApplicableProduct) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, "Coupon not applicable to cart products")
        );
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === "FLAT") {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, orderValue);

  res.status(200).json(
    new ApiResponse(200, "Coupon is valid", {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.round(orderValue - discountAmount),
    })
  );
});

/**
 * UPDATE COUPON
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // If code is being updated, check for uniqueness
  if (updateData.code) {
    const existingCoupon = await Coupon.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingCoupon) {
      return res
        .status(409)
        .json(new ApiResponse(409, "Coupon code already exists"));
    }
    updateData.code = updateData.code.toUpperCase();
  }

  // Validate dates if being updated
  if (updateData.startDate && updateData.expiryDate) {
    if (new Date(updateData.startDate) >= new Date(updateData.expiryDate)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Start date must be before expiry date"));
    }
  }

  const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return res.status(404).json(new ApiResponse(404, "Coupon not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Coupon updated successfully", coupon));
});

/**
 * DELETE COUPON
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    return res.status(404).json(new ApiResponse(404, "Coupon not found"));
  }

  res.status(200).json(new ApiResponse(200, "Coupon deleted successfully"));
});

/**
 * MARK COUPON AS USED
 */
const markCouponAsUsed = asyncHandler(async (req, res) => {
  const { code, userId } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json(new ApiResponse(404, "Coupon not found"));
  }

  coupon.usedCount += 1;
  if (userId) {
    coupon.usedBy.push({ user: userId, usedAt: new Date() });
  }

  await coupon.save();

  res.status(200).json(new ApiResponse(200, "Coupon usage recorded"));
});

/**
 * GET ACTIVE COUPONS FOR USER
 */
const getActiveCoupons = asyncHandler(async (req, res) => {
  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gte: now },
    $or: [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  })
    .select("-usedBy -createdBy")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Active coupons fetched successfully", coupons)
    );
});

export {
  createCoupon,
  getAllCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  markCouponAsUsed,
  getActiveCoupons,
};
