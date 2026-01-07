import { Order } from "../model/order.model.js";
import { Payment } from "../model/payment.model.js";
import { Cart } from "../model/cart.model.js";
import { Coupon } from "../model/coupon.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { User } from "../model/user.model.js";
import { getOrderStatusEmailContent } from "../template/getOrderStatusEmailContent .js";
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
      couponCode = null,
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
      couponCode: couponCode || null,
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
      // Mark coupon as used
      if (couponCode) {
        try {
          const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
          if (coupon) {
            coupon.usedCount += 1;
            coupon.usedBy.push({ user: userId, usedAt: new Date() });
            await coupon.save();
          }
        } catch (couponError) {
          console.error("Error updating coupon usage:", couponError);
          // Don't fail the order if coupon update fails
        }
      }


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
    .sort({ createdAt: -1 });
  console.log("Orders ", orders);
  if (!orders || orders.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No orders found"));
  }
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
export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const {
      orderStatus,
      paymentStatus,
      shippingAddress,
      trackingId,
      courierName,
      estimatedDelivery,
      deliveredAt,
      cancellationReason,
      returnedAt,
      notes,
      discount,
      deliveryCharge,
    } = req.body;

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return res.status(404).json(new ApiResponse(404, "Order not found"));
    }
    const previousStatus = order.orderStatus;
    // Update allowed fields (excluding items, user, and other critical fields)
    if (orderStatus !== undefined) order.orderStatus = orderStatus;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (shippingAddress !== undefined) order.shippingAddress = shippingAddress;
    if (trackingId !== undefined) order.trackingId = trackingId;
    if (courierName !== undefined) order.courierName = courierName;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;
    if (deliveredAt !== undefined) order.deliveredAt = deliveredAt;
    if (cancellationReason !== undefined) order.cancellationReason = cancellationReason;
    if (returnedAt !== undefined) order.returnedAt = returnedAt;
    if (notes !== undefined) order.notes = notes;

    // If discount or deliveryCharge changed, recalculate totalAmount
    let recalculate = false;
    if (discount !== undefined && discount !== order.discount) {
      order.discount = discount;
      recalculate = true;
    }
    if (deliveryCharge !== undefined && deliveryCharge !== order.deliveryCharge) {
      order.deliveryCharge = deliveryCharge;
      recalculate = true;
    }

    if (recalculate) {
      order.totalAmount = order.subtotal - order.discount + order.deliveryCharge;
    }

    // Auto-update payment status based on order status
    if (orderStatus === "DELIVERED" && order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
      order.isPaid = true;
      order.paidAt = new Date();
    }

    // Set deliveredAt timestamp if status changed to DELIVERED
    if (orderStatus === "DELIVERED" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();
    if (
      orderStatus &&
      orderStatus !== previousStatus &&
      ["SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].includes(orderStatus)
    ) {
      const emailContent = getOrderStatusEmailContent({
        order,
        user: order.user,
        status: orderStatus,
      });

      if (emailContent) {
        // 📩 USER EMAIL
        await sendEmail({
          email: order.user.email,
          subject: emailContent.user.subject,
          title: emailContent.user.title,
          message: emailContent.user.message,
          buttonText: "Track Order",
          url: `${process.env.FRONT_END_URL}/my-account/orders/${order._id}`,
        });

        // 📩 ADMIN EMAIL
        await sendEmail({
          email: process.env.EMAIL_USER,
          subject: emailContent.admin.subject,
          title: emailContent.admin.title,
          message: emailContent.admin.message,
          buttonText: "View Order",
          url: `${process.env.ADMIN_PANEL_URL}/orders/${order._id}`,
        });
        console.log("Status update emails sent");

      }
    }

    const updatedOrder = await Order.findById(orderId)
      .populate("items.product items.color items.size paymentId items.design.designId user")
      .lean();

    res.status(200).json(
      new ApiResponse(200, "Order updated successfully", updatedOrder)
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};

