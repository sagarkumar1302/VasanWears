import React, { useEffect, useState } from "react";
import Banner from "../components/Common/Banner";
import {
  RiBankCardLine,
  RiEdit2Line,
  RiEditLine,
  RiPencilLine,
  RiPenNibLine,
} from "@remixicon/react";

import { useCartStore } from "../store/cartStore";
import Loader from "../components/Common/Loader";
import { Link, useNavigate } from "react-router-dom";
import { placeOrderApi, verifyPaymentApi } from "../utils/orderApi";
const Checkout = () => {
  const { items, subtotal, fetchCart, loading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  /* ---------------- COUPON ---------------- */
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    altPhone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  const validateCheckout = () => {
    if (!shipping.fullName || !shipping.phone || !shipping.address) {
      return "Name, phone and address are required";
    }

    if (shipping.phone.length !== 10) {
      return "Enter valid phone number";
    }

    if (items.length === 0) {
      return "Your cart is empty";
    }

    return null;
  };

  const applyCoupon = () => {
    if (coupon === "SAVE10") {
      setDiscount(10);
      setCouponError("");
    } else if (coupon === "SAVE20") {
      setDiscount(20);
      setCouponError("");
    } else {
      setDiscount(0);
      setCouponError("Invalid coupon code");
    }
  };

  const total = Math.max(subtotal - discount, 0);
  const handlePlaceOrder = async () => {
    const error = validateCheckout();
    if (error) {
      alert(error);
      return;
    }

    setPlacingOrder(true);

    const payload = {
      shippingAddress: {
        fullName: shipping.fullName,
        phone: shipping.phone,
        alternatePhone: shipping.altPhone || null,
        addressLine1: shipping.address,
        landmark: shipping.landmark || null,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
      },
      paymentMethod,
      discount,
    };

    try {
      // ================= COD =================
      if (paymentMethod === "COD") {
        const res = await placeOrderApi(payload);

        navigate("/thank-you", {
          state: { orderId: res.data.order._id },
        });
      }

      // ================= ONLINE =================
      if (paymentMethod === "ONLINE") {
        await startRazorpayPayment(payload);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };
  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const startRazorpayPayment = async (payload) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    // 1️⃣ Create order in backend
    const res = await placeOrderApi({
      ...payload,
      paymentMethod: "ONLINE",
    });

    const { razorpayOrder, order, paymentId } = res.data;

    // 2️⃣ Open Razorpay
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      order_id: razorpayOrder.id,
      name: "VasanWears",
      description: "Order Payment",
      handler: async (response) => {
        try {
          await verifyPaymentApi({
            paymentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          navigate("/thank-you", {
            state: { orderId: order._id },
          });
        } catch (err) {
          alert("Payment verification failed");
          setPlacingOrder(false);
        }
      },
      modal: {
        ondismiss: () => {
          alert("Payment cancelled");
          setPlacingOrder(false); // 🔑 VERY IMPORTANT
        },
      },
      theme: { color: "#000000" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="md:mt-35 mt-30">
      <Banner pageTitle="Checkout" />

      {/* ---------------- COUPON TOGGLE ---------------- */}
      <div className="px-5 py-5 md:py-20">
        <div className="container mx-auto mb-5">
          <div className="border-t-2 border-primary5 bg-primary3/60 rounded-md p-4">
            <p className="text-sm flex items-center gap-2">
              <span className="text-primary5 font-semibold">
                <RiBankCardLine />
              </span>
              Have a coupon?
              <button
                onClick={() => setShowCoupon(!showCoupon)}
                className="text-primary5 underline font-medium cursor-pointer"
              >
                Click here to enter your code
              </button>
            </p>

            <div
              className={`overflow-hidden transition-all duration-500 ${
                showCoupon ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex gap-3 md:flex-row flex-col">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="border rounded-md px-4 py-2 outline-none md:w-[85%] w-full"
                />

                <button
                  onClick={applyCoupon}
                  className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
                  transition-all duration-300 btn-slide cursor-pointer md:w-[15%] w-full"
                >
                  Apply Coupon
                </button>
              </div>

              {couponError && (
                <p className="text-red-500 text-xs mt-2">{couponError}</p>
              )}

              {discount > 0 && (
                <p className="text-primary5 text-xs mt-2 font-semibold">
                  Coupon applied! You saved ₹{discount}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* ---------------- LEFT ---------------- */}
            <div className="lg:col-span-2 space-y-5">
              {/* SHIPPING */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    placeholder="Full Name"
                    className="border px-4 py-2"
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping({ ...shipping, fullName: e.target.value })
                    }
                  />
                  <input
                    placeholder="Phone Number"
                    className="border px-4 py-2"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping({ ...shipping, phone: e.target.value })
                    }
                  />
                  <input
                    placeholder="Alternate Phone (Optional)"
                    className="border px-4 py-2 rounded-md"
                    value={shipping.altPhone}
                    onChange={(e) =>
                      setShipping({ ...shipping, altPhone: e.target.value })
                    }
                  />
                  <input
                    placeholder="Address Line 1"
                    className="border px-4 py-2 md:col-span-2"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping({ ...shipping, address: e.target.value })
                    }
                  />
                  <input
                    placeholder="Landmark (Optional)"
                    className="border px-4 py-2 rounded-md md:col-span-2"
                    value={shipping.landmark}
                    onChange={(e) =>
                      setShipping({ ...shipping, landmark: e.target.value })
                    }
                  />
                  <input
                    placeholder="City"
                    className="border px-4 py-2"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                  />
                  <input
                    placeholder="State"
                    className="border px-4 py-2"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping({ ...shipping, state: e.target.value })
                    }
                  />
                  <input
                    placeholder="Pincode"
                    className="border px-4 py-2"
                    value={shipping.pincode}
                    onChange={(e) =>
                      setShipping({ ...shipping, pincode: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* PAYMENT */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

                <label className="flex gap-3 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  Cash on Delivery
                </label>

                <label className="flex gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                  />
                  UPI / Card / Net Banking
                </label>
              </div>
            </div>

            {/* ---------------- RIGHT ---------------- */}
            <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-35">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <Link
                  to="/cart"
                  className="py-2.5 px-4 rounded-xl font-semibold text-primary2 
                transition-all duration-300 btn-slide w-fit cursor-pointer flex gap-4 items-center text-sm"
                >
                  <RiPencilLine size={18} />
                  Edit Cart
                </Link>
              </div>

              <div className="space-y-4 text-sm">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    {/* IMAGE */}
                    <img
                      src={
                        item.itemType === "catalog"
                          ? item.product?.featuredImage
                          : item.design?.images?.front
                      }
                      alt="Order item"
                      className="w-16 h-20 object-cover rounded border"
                    />

                    {/* DETAILS */}
                    <div className="text-sm text-primary5">
                      <p className="font-medium">
                        {item.itemType === "catalog"
                          ? item.product?.title
                          : item.design?.title || "Custom Designed Product"}
                      </p>

                      <p className="text-xs text-gray-500">
                        Color:{" "}
                        {item.itemType === "catalog"
                          ? item.color?.name
                          : item.design?.color?.name}
                        {" | "}
                        Size:{" "}
                        {item.itemType === "catalog"
                          ? item.size?.name || "Free Size"
                          : item.design?.size?.name || "Free Size"}
                      </p>

                      {item.itemType === "custom" && (
                        <p className="text-xs text-primary5 font-medium">
                          Custom Print
                        </p>
                      )}

                      <p className="font-semibold mt-1">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}

                <hr />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold">Free</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-primary5 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <hr />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className={`py-2.5 px-8 rounded-xl font-semibold w-full mt-6
    ${placingOrder ? "opacity-60 cursor-not-allowed" : "btn-slide"}
  `}
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
