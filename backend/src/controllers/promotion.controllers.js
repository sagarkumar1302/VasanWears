import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Promotion } from "../model/promotion.model.js";

/**
 * CREATE PROMOTION
 */
const createPromotion = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    buyQuantity,
    applicableProducts,
    applicableCategories,
    benefitType,
    freeQuantity,
    discountValue,
    maxDiscountAmount,
    maxUsagePerOrder,
    startDate,
    endDate,
    isActive,
  } = req.body;

  // Validation
  if (!name || !buyQuantity || !benefitType || !startDate || !endDate) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Required fields are missing"));
  }

  // Validate benefit-specific fields
  if (benefitType === "FREE_ITEM" && !freeQuantity) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Free quantity is required for FREE_ITEM benefit"));
  }

  if (
    (benefitType === "PERCENTAGE_DISCOUNT" || benefitType === "FLAT_DISCOUNT") &&
    !discountValue
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Discount value is required for discount benefits"));
  }

  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Start date must be before end date"));
  }

  const promotion = await Promotion.create({
    name,
    description,
    buyQuantity,
    applicableProducts: applicableProducts || [],
    applicableCategories: applicableCategories || [],
    benefitType,
    freeQuantity,
    discountValue,
    maxDiscountAmount,
    maxUsagePerOrder: maxUsagePerOrder || 1,
    startDate,
    endDate,
    isActive: isActive !== undefined ? isActive : true,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Promotion created successfully", promotion));
});

/**
 * GET ALL PROMOTIONS
 */
const getAllPromotions = asyncHandler(async (req, res) => {
  const { isActive, benefitType } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }
  if (benefitType) {
    filter.benefitType = benefitType;
  }

  const promotions = await Promotion.find(filter)
    .populate("applicableProducts", "title slug featuredImage")
    .populate("applicableCategories", "name slug")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Promotions fetched successfully", promotions)
    );
});

/**
 * GET PROMOTION BY ID
 */
const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findById(id)
    .populate("applicableProducts", "title slug featuredImage")
    .populate("applicableCategories", "name slug");

  if (!promotion) {
    return res.status(404).json(new ApiResponse(404, "Promotion not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Promotion fetched successfully", promotion));
});

/**
 * CHECK APPLICABLE PROMOTIONS
 */
const checkApplicablePromotions = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Cart items are required"));
  }

  const now = new Date();

  // Get all active promotions
  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate("applicableProducts")
    .populate("applicableCategories");

  const applicablePromotions = [];

  for (const promotion of promotions) {
    // Check if promotion applies to cart items
    const productQuantities = {};

    for (const item of cartItems) {
      const productId = item.productId?.toString();
      const categoryId = item.categoryId?.toString();

      // Check if this product is applicable
      const isApplicable =
        promotion.applicableProducts.length === 0 ||
        promotion.applicableProducts.some((p) => p._id.toString() === productId) ||
        promotion.applicableCategories.some((c) => c._id.toString() === categoryId);

      if (isApplicable) {
        productQuantities[productId] =
          (productQuantities[productId] || 0) + item.quantity;
      }
    }

    // Check if any product meets the buy quantity requirement
    for (const [productId, quantity] of Object.entries(productQuantities)) {
      if (quantity >= promotion.buyQuantity) {
        const applicableTimes = Math.min(
          Math.floor(quantity / promotion.buyQuantity),
          promotion.maxUsagePerOrder
        );

        let benefit = {};
        if (promotion.benefitType === "FREE_ITEM") {
          benefit = {
            type: "FREE_ITEM",
            freeQuantity: promotion.freeQuantity * applicableTimes,
            description: `Buy ${promotion.buyQuantity}, Get ${promotion.freeQuantity} Free`,
          };
        } else if (promotion.benefitType === "PERCENTAGE_DISCOUNT") {
          benefit = {
            type: "PERCENTAGE_DISCOUNT",
            discountValue: promotion.discountValue,
            maxDiscountAmount: promotion.maxDiscountAmount,
            description: `${promotion.discountValue}% off on ${promotion.buyQuantity} or more items`,
          };
        } else if (promotion.benefitType === "FLAT_DISCOUNT") {
          benefit = {
            type: "FLAT_DISCOUNT",
            discountValue: promotion.discountValue * applicableTimes,
            description: `₹${promotion.discountValue} off on ${promotion.buyQuantity} or more items`,
          };
        }

        applicablePromotions.push({
          promotionId: promotion._id,
          name: promotion.name,
          description: promotion.description,
          benefit,
          productId,
          applicableTimes,
        });
        break; // Only add promotion once per promotion
      }
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      "Applicable promotions fetched successfully",
      applicablePromotions
    )
  );
});

/**
 * CALCULATE PROMOTION BENEFIT
 */
const calculatePromotionBenefit = asyncHandler(async (req, res) => {
  const { promotionId, productPrice, quantity } = req.body;

  if (!promotionId || !productPrice || !quantity) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Required fields are missing"));
  }

  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    return res.status(404).json(new ApiResponse(404, "Promotion not found"));
  }

  // Check if promotion is active
  const now = new Date();
  if (!promotion.isActive || now < promotion.startDate || now > promotion.endDate) {
    return res.status(400).json(new ApiResponse(400, "Promotion is not active"));
  }

  // Check if quantity meets requirement
  if (quantity < promotion.buyQuantity) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          `Minimum ${promotion.buyQuantity} items required for this promotion`
        )
      );
  }

  const applicableTimes = Math.min(
    Math.floor(quantity / promotion.buyQuantity),
    promotion.maxUsagePerOrder
  );

  let benefitAmount = 0;
  let freeItems = 0;

  if (promotion.benefitType === "FREE_ITEM") {
    freeItems = promotion.freeQuantity * applicableTimes;
  } else if (promotion.benefitType === "PERCENTAGE_DISCOUNT") {
    const totalValue = productPrice * quantity;
    benefitAmount = (totalValue * promotion.discountValue) / 100;
    if (promotion.maxDiscountAmount) {
      benefitAmount = Math.min(benefitAmount, promotion.maxDiscountAmount);
    }
  } else if (promotion.benefitType === "FLAT_DISCOUNT") {
    benefitAmount = promotion.discountValue * applicableTimes;
  }

  res.status(200).json(
    new ApiResponse(200, "Promotion benefit calculated successfully", {
      promotion: {
        name: promotion.name,
        benefitType: promotion.benefitType,
      },
      benefitAmount: Math.round(benefitAmount),
      freeItems,
      applicableTimes,
    })
  );
});

/**
 * UPDATE PROMOTION
 */
const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate dates if being updated
  if (updateData.startDate && updateData.endDate) {
    if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Start date must be before end date"));
    }
  }

  const promotion = await Promotion.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!promotion) {
    return res.status(404).json(new ApiResponse(404, "Promotion not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Promotion updated successfully", promotion));
});

/**
 * DELETE PROMOTION
 */
const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findByIdAndDelete(id);

  if (!promotion) {
    return res.status(404).json(new ApiResponse(404, "Promotion not found"));
  }

  res.status(200).json(new ApiResponse(200, "Promotion deleted successfully"));
});

/**
 * GET ACTIVE PROMOTIONS
 */
const getActivePromotions = asyncHandler(async (req, res) => {
  const now = new Date();

  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate("applicableProducts", "title slug featuredImage")
    .populate("applicableCategories", "name slug")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Active promotions fetched successfully", promotions)
    );
});

export {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  checkApplicablePromotions,
  calculatePromotionBenefit,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
};
