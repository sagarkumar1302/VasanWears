import React, { useEffect, useState, useCallback, memo } from "react";
import Banner from "../components/Common/Banner";
import { RiBankCardLine, RiPencilLine, RiPenNibLine } from "@remixicon/react";

import { useCartStore } from "../store/cartStore";
import Loader from "../components/Common/Loader";
import { Link, useNavigate } from "react-router-dom";
import { placeOrderApi, verifyPaymentApi } from "../utils/orderApi";
import { validateCouponApi } from "../utils/couponApi";
import { clearCartApi } from "../utils/cartApi";
import { updateDesignApi } from "../utils/designApi";
const Checkout = memo(() => {
  const { items, subtotal, fetchCart, loading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  // Extra checkout options
  const GIFT_WRAP_FEE = 60; // rupees
  const EXPRESS_FEE = 60; // rupees
  const [giftWrap, setGiftWrap] = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);

  /* ---------------- DESIGN PERMISSION MODAL ---------------- */
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [customDesigns, setCustomDesigns] = useState([]);

  /* ---------------- COUPON ---------------- */
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
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
  const validateCheckout = useCallback(() => {
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
  }, [shipping, items]);

  const applyCoupon = useCallback(async () => {
    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const products = items.map((item) => ({
        productId: item.product?._id || item.design?._id,
        categoryId: item.product?.category || item.design?.category,
      }));

      const response = await validateCouponApi({
        code: coupon,
        orderValue: subtotal,
        userId: null, // Will be set from token in backend
        products,
      });

      setDiscount(response.data.discountAmount);
      setAppliedCoupon(response.data.coupon);
      setCouponError("");
    } catch (err) {
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponError(
        err.response?.data?.message || "Invalid or expired coupon code"
      );
    } finally {
      setValidatingCoupon(false);
    }
  }, [coupon, items, subtotal]);

  const removeCoupon = useCallback(() => {
    setCoupon("");
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError("");
  }, []);

  /* ---------------- DESIGN PERMISSION HANDLERS ---------------- */
  const handleGrantPermission = useCallback(async () => {
    try {
      // Update all custom designs with permission

      for (const item of customDesigns) {
        if (item.design?.designId?._id) {
          await updateDesignApi(item.design?.designId?._id, {
            haveGivenPermissionToSell: true,
          });
        }
      }

      // Close modal and navigate
      setShowPermissionModal(false);
      navigate("/thank-you", {
        state: { orderId: pendingOrderId },
      });
    } catch (err) {
      console.error("Failed to update design permission:", err);
      // Still navigate even if update fails
      setShowPermissionModal(false);
      navigate("/thank-you", {
        state: { orderId: pendingOrderId },
      });
    }
  }, [customDesigns, pendingOrderId, navigate]);

  const handleSkipPermission = useCallback(() => {
    setShowPermissionModal(false);
    navigate("/thank-you", {
      state: { orderId: pendingOrderId },
    });
  }, [pendingOrderId, navigate]);
  // COD Charge
  const codCharge = paymentMethod === "COD" ? 60 : 0;
  const extraCharges = (giftWrap ? GIFT_WRAP_FEE : 0) + (expressDelivery ? EXPRESS_FEE : 0);
  const total = Math.max(subtotal - discount + codCharge + extraCharges, 0);
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
      deliveryCharge: codCharge,
      discount,
      couponCode: appliedCoupon?.code || null,
    };

    try {
      // ================= COD =================
      if (paymentMethod === "COD") {
        const res = await placeOrderApi(payload);

        // Check if there are custom designs
        const customItems = items.filter((item) => item.itemType === "custom");

        if (customItems.length > 0) {
          // Store custom designs and order ID, show modal
          setCustomDesigns(customItems);
          setPendingOrderId(res.data.order._id);
          setShowPermissionModal(true);
          clearCartApi();
        } else {
          // No custom items, navigate directly
          clearCartApi();
          navigate("/thank-you", {
            state: { orderId: res.data.order._id },
          });
        }
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
  const loadRazorpay = useCallback(
    () =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      }),
    []
  );

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

          // Check if there are custom designs
          const customItems = items.filter(
            (item) => item.itemType === "custom"
          );

          if (customItems.length > 0) {
            // Store custom designs and order ID, show modal
            setCustomDesigns(customItems);
            setPendingOrderId(order._id);
            setShowPermissionModal(true);
            clearCartApi();
          } else {
            // No custom items, navigate directly
            clearCartApi();
            navigate("/thank-you", {
              state: { orderId: order._id },
            });
          }
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
                  className="border rounded-xl px-4 py-2 outline-none md:w-[85%] w-full"
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={appliedCoupon !== null}
                />

                {appliedCoupon ? (
                  <button
                    onClick={removeCoupon}
                    className="py-2.5 px-8 rounded-xl font-semibold bg-red-500 text-white
                    transition-all duration-300 cursor-pointer md:w-[15%] w-full"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={applyCoupon}
                    disabled={validatingCoupon}
                    className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
                    transition-all duration-300 btn-slide cursor-pointer md:w-[15%] w-full
                    disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {validatingCoupon ? "Checking..." : "Apply Coupon"}
                  </button>
                )}
              </div>

              {couponError && (
                <p className="text-red-500 text-xs mt-2">{couponError}</p>
              )}

              {discount > 0 && appliedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-green-700 text-sm font-semibold">
                    ✓ Coupon "{appliedCoupon.code}" applied!
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    You saved ₹{discount}
                    {appliedCoupon.discountType === "PERCENTAGE" && (
                      <p>Coupon applied! You saved ₹{discount}</p>
                    )}
                  </p>
                </div>
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
                    className="border px-4 py-2 rounded-xl"
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping({ ...shipping, fullName: e.target.value })
                    }
                  />
                  <input
                    placeholder="Phone Number"
                    className="border px-4 py-2 rounded-xl"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping({ ...shipping, phone: e.target.value })
                    }
                  />
                  <input
                    placeholder="Alternate Phone (Optional)"
                    className="border px-4 py-2 rounded-xl md:col-span-2"
                    value={shipping.altPhone}
                    onChange={(e) =>
                      setShipping({ ...shipping, altPhone: e.target.value })
                    }
                  />
                  <input
                    placeholder="Address Line 1"
                    className="border px-4 py-2 md:col-span-2 rounded-xl"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping({ ...shipping, address: e.target.value })
                    }
                  />
                  <input
                    placeholder="Landmark (Optional)"
                    className="border px-4 py-2 rounded-xl md:col-span-2"
                    value={shipping.landmark}
                    onChange={(e) =>
                      setShipping({ ...shipping, landmark: e.target.value })
                    }
                  />
                  <input
                    placeholder="City"
                    className="border px-4 py-2 rounded-xl"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                  />
                  <input
                    placeholder="State"
                    className="border px-4 py-2 rounded-xl"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping({ ...shipping, state: e.target.value })
                    }
                  />
                  <input
                    placeholder="Pincode"
                    className="border px-4 py-2 rounded-xl"
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
                      alt={
                        item.itemType === "catalog"
                          ? item.product?.title
                          : item.design?.title || "Custom design"
                      }
                      loading="lazy"
                      className="w-16 h-20 object-cover rounded"
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

                {paymentMethod !== "COD" && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold">Free</span>
                  </div>
                )}
                {paymentMethod === "COD" && (
                  <div className="flex justify-between text-orange-600">
                    <span>COD Charges</span>
                    <span>₹{codCharge}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-primary5 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <hr />

                {/* Extra options: Gift wrap / Express delivery */}
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={() => setGiftWrap((p) => !p)}
                    />
                    <span className="text-sm">Add gift wrap (₹{GIFT_WRAP_FEE})</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={expressDelivery}
                      onChange={() => setExpressDelivery((p) => !p)}
                    />
                    <span className="text-sm">Express delivery (₹{EXPRESS_FEE})</span>
                  </label>
                </div>

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

              {/* Wash / Iron care information */}
              <div className="mt-4 bg-gray-50 border border-gray-100 rounded-md p-3 text-sm">
                <h3 className="font-semibold mb-2">Care Instructions</h3>
                <p>Please follow these tips to improve print longevity:</p>
                <ul className="list-none mt-2 space-y-1">
                  <li>✅ Wash inside out</li>
                  <li>✅ Cold wash</li>
                  <li>✅ Avoid high heat drying</li>
                  <li>✅ Do not bleach</li>
                  <li>✅ Turn garment inside out before ironing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- DESIGN PERMISSION MODAL ---------------- */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <RiPenNibLine className="mx-auto text-primary5" size={48} />
              </div>
              <h3 className="text-xl font-bold text-primary5 mb-3">
                Share Your Design?
              </h3>
              <p className="text-gray-600 mb-6">
                Would you like to give permission to publish your custom
                design(s) as a product on our website? Other customers will be
                able to purchase your design!
              </p>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={handleSkipPermission}
                  className="cursor-pointer flex-1 py-3 px-6 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  No, Thanks
                </button>
                <button
                  onClick={handleGrantPermission}
                  className="cursor-pointer flex-1 py-3 px-6 rounded-xl font-semibold btn-slide text-primary2"
                >
                  Yes, Publish It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Checkout;
