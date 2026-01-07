import crypto from "crypto";
import { Payment } from "../model/payment.model.js";
import { Order } from "../model/order.model.js";
import { Coupon } from "../model/coupon.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { Cart } from "../model/cart.model.js";

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Payment not found"));
    }

    if (payment.status === "PAID") {
      return res
        .status(200)
        .json(new ApiResponse(200, "Payment already verified"));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "FAILED";
      await payment.save();

      return res
        .status(400)
        .json(new ApiResponse(400, "Payment verification failed"));
    }

    payment.status = "PAID";
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.gatewaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.order).populate("user");
    order.paymentStatus = "PAID";
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = "CONFIRMED";
    await order.save();

    // Mark coupon as used for online payment
    if (order.couponCode) {
      try {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount += 1;
          coupon.usedBy.push({ user: order.user._id, usedAt: new Date() });
          await coupon.save();
        }
      } catch (couponError) {
        console.error("Error updating coupon usage:", couponError);
        // Don't fail the payment if coupon update fails
      }
    }

    await Cart.findOneAndUpdate(
      { user: order.user._id },
      { items: [], subtotal: 0 }
    );

    // ✅ USER EMAIL
    await sendEmail({
      email: order.user.email,
      subject: "Payment Successful - VasanWears",
      title: "Payment Received ✅",
      message: `
    Hi ${order.user.fullName},<br/><br/>
    Your payment for order <b>#${order._id}</b> was successful.<br/>
    We’ll start processing your order shortly.
  `,
      buttonText: "Track Order",
      buttonLink: `${process.env.FRONTEND_URL}/orders/${order._id}`,
    });

    // ADMIN EMAIL
    await sendEmail({
      email: process.env.EMAIL_USER,
      subject: "New Paid Order - VasanWears",
      title: "Payment Confirmed 💰",
      message: `
    <b>Order ID:</b> ${order._id}<br/>
    <b>Customer:</b> ${order.user.fullName} (${order.user.email})<br/>
    <b>Total:</b> ₹${order.totalAmount}<br/>
    <b>Payment:</b> ONLINE (PAID)
  `,
      buttonText: "View Order",
      buttonLink: `${process.env.ADMIN_PANEL_URL}/orders/${order._id}`,
    });

    return res.status(200).json(
      new ApiResponse(200, "Payment verified successfully", {
        order,
        payment,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error.message));
  }
};



