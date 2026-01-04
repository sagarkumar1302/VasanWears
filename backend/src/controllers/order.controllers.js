import { Order } from "../model/order.model.js";
import { Payment } from "../model/payment.model.js";
import { Cart } from "../model/cart.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { User } from "../model/user.model.js";

import razorpay from "../utils/razorpay.js";
import crypto from "crypto";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const {
      shippingAddress,
      paymentMethod,
      discount = 0,
      deliveryCharge = 0,
    } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Missing required fields"));
    }

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product items.color items.size items.design.designId"
    );

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Cart is empty"));
    }

    /* ================= BUILD ORDER ITEMS ================= */
    const orderItems = cart.items.map((item) => {
      // ---------- CATALOG ----------
      if (item.itemType === "catalog") {
        return {
          itemType: "catalog",
          product: item.product,
          variant: item.variant,
          color: item.color,
          size: item.size || null,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };
      }

      // ---------- CUSTOM DESIGN ----------
      // ---------- CUSTOM DESIGN ----------
      return {
        itemType: "custom",
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,

        design: {
          designId: item.design.designId,
          title: item.design.title,
          images: item.design.images,

          // ✅ SNAPSHOT THESE
          size: {
            id: item.design.size?.id || null,
            name: item.design.size?.name || null,
          },
          color: {
            id: item.design.color?.id || null,
            name: item.design.color?.name || null,
            hexCode: item.design.color?.hexCode || null,
          },
        },
      };

    });

    const subtotal = cart.subtotal;
    const totalAmount = subtotal - discount + deliveryCharge;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      shippingAddress,
    });

    /* ================= COD ================= */
    if (paymentMethod === "COD") {
      const payment = await Payment.create({
        user: userId,
        order: order._id,
        method: "COD",
        amount: totalAmount,
        status: "PENDING",
      });

      order.paymentId = payment._id;
      await order.save();

      cart.items = [];
      cart.subtotal = 0;
      await cart.save();

      await sendEmail({
        email: user.email,
        subject: "Order Placed - VasanWears",
        title: "Order Confirmed 🛍️",
        message: `Your order <b>#${order._id}</b> has been placed successfully.`,
        buttonText: "View Order",
        buttonLink: `${process.env.FRONTEND_URL}/orders/${order._id}`,
      });
      await sendEmail({
        email: process.env.EMAIL_USER,
        subject: "New COD Order - VasanWears",
        title: "New Order Received 📦",
        message: `
          <b>Order ID:</b> ${order._id}<br/>
          <b>Customer:</b> ${user.fullName} (${user.email})<br/>
          <b>Total:</b> ₹${order.totalAmount}<br/>
          <b>Payment:</b> COD
        `,
        buttonText: "View Order",
        buttonLink: `${process.env.ADMIN_PANEL_URL}/orders/${order._id}`,
      });
      return res
        .status(201)
        .json(new ApiResponse(201, "COD order placed", { order }));
    }

    /* ================= ONLINE ================= */
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${order._id}`,
    });

    const payment = await Payment.create({
      user: userId,
      order: order._id,
      method: "ONLINE",
      amount: totalAmount,
      gateway: "RAZORPAY",
      gatewayOrderId: razorpayOrder.id,
      status: "PENDING",
    });

    order.paymentId = payment._id;
    await order.save();

    return res.status(201).json(
      new ApiResponse(201, "Razorpay order created", {
        order,
        razorpayOrder,
        paymentId: payment._id,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("items.product items.color items.size items.design.designId paymentId user")
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully", orders)
  );
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate(
      "items.product items.color items.size items.design.designId paymentId"
    )
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully", orders)
  );
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product items.color items.size paymentId items.design.designId")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Order not found"));
    }

    res.status(200).json(
      new ApiResponse(200, "Order fetched successfully", order)
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};

