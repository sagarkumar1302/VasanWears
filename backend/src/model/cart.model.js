import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Product.variants._id
    },

    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: true,
    },

    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      default: null, // null = free size / any size
    },

    sku: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      min: 1,
      required: true,
    },

    price: {
      type: Number,
      required: true, // snapshot price (sale || regular)
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ONE CART PER USER ✅
    },

    items: [cartItemSchema],

    subtotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
