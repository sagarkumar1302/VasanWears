import mongoose from "mongoose";

/* ================= ORDER ITEM ================= */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId, // Product.variants._id
      required: true,
    },

    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: true,
    },

    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      default: null, // free-size products
    },

    sku: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true, // snapshot price at purchase time
    },

    total: {
      type: Number,
      required: true, // price * quantity
    },

    // Optional design snapshot for customized products
    design: {
      type: Object,
      default: null,
    },
  },
  { _id: false }
);

/* ================= SHIPPING ADDRESS ================= */
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    alternatePhone: {
      type: String,
      default: null,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },
  },
  { _id: false }
);

/* ================= ORDER SCHEMA ================= */
const orderSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= ITEMS ================= */
    items: {
      type: [orderItemSchema],
      required: true,
    },

    /* ================= PRICE DETAILS ================= */
    subtotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ================= PAYMENT ================= */
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    /* ================= ORDER STATUS ================= */
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
      default: "PLACED",
    },

    /* ================= SHIPPING ================= */
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    trackingId: {
      type: String,
      default: null,
    },

    courierName: {
      type: String,
      default: null,
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    /* ================= CANCELLATION / RETURN ================= */
    cancellationReason: {
      type: String,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    /* ================= SYSTEM ================= */
    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: null, // admin/internal notes
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
