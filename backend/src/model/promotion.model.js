import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    /* ================= BASIC ================= */
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    /* ================= CONDITIONS ================= */
    buyQuantity: {
      type: Number, // X
      required: true,
    },

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    /* ================= BENEFIT ================= */
    benefitType: {
      type: String,
      enum: ["FREE_ITEM", "PERCENTAGE_DISCOUNT", "FLAT_DISCOUNT"],
      required: true,
    },

    freeQuantity: {
      type: Number, // Y (Buy X Get Y)
    },

    discountValue: {
      type: Number, // % or ₹
    },

    maxDiscountAmount: {
      type: Number,
    },

    /* ================= LIMITS ================= */
    maxUsagePerOrder: {
      type: Number,
      default: 1,
    },

    /* ================= VALIDITY ================= */
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model("Promotion", promotionSchema);
