import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["catalog", "custom"],
      required: true,
    },

    /* =========================
       NORMAL CATALOG PRODUCT
       ========================= */
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return this.itemType === "catalog";
      },
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () {
        return this.itemType === "catalog";
      },
    },

    // Snapshot of variant data (images, prices, stock, etc.)
    variantData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: function () {
        return this.itemType === "catalog";
      },
    },

    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      default: null,
    },

    sku: {
      type: String,
    },

    /* =========================
       CUSTOM DESIGN PRODUCT
       ========================= */
    design: {
      designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Design",
      },

      // 🔒 SNAPSHOT (required for safety)
      title: String,

      images: {
        front: String,
        back: String,
        frontDesignArea: String,
        backDesignArea: String,
      },
      size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
        default: null,
      },

      // 🎨 Selected color (snapshot)
      color: {
        id: mongoose.Schema.Types.ObjectId, // optional
        name: String,
        hexCode: String,
      },
    },

    /* =========================
       COMMON FIELDS
       ========================= */
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },

    price: {
      type: Number,
      required: true,
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
      unique: true,
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
