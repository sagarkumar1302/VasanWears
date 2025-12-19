import React, { useState } from "react";

import Banner from "../components/Common/Banner";
import { RiBankCardLine } from "@remixicon/react";

const Checkout = () => {
  const subtotal = 34; // later you can make this dynamic

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
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
  const [showCoupon, setShowCoupon] = useState(false);

  return (
    <div className="md:mt-35 mt-30">
      <Banner pageTitle="Checkout" />
      {/* TOP COUPON TOGGLE */}
      <div className="px-5 py-5 md:py-20">
        <div className="container mx-auto mb-5">
          <div className="border-t-2 border-primary5 bg-primary3/60 rounded-md p-4">
            <p className="text-sm flex items-center gap-2">
              <span className="text-primary5 font-semibold"><RiBankCardLine/></span>
              Have a coupon?
              <button
                onClick={() => setShowCoupon(!showCoupon)}
                className="text-primary5 underline font-medium cursor-pointer"
              >
                Click here to enter your code
              </button>
            </p>

            {/* COUPON INPUT (ANIMATED) */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showCoupon ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex gap-3 md:flex-row flex-col">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="border rounded-md px-4 py-2 outline-none w-full md:w-[85%]"
                />

                <button
                  onClick={applyCoupon}
                  className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer md:w-[15%] w-full"
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

        <div className="container mx-auto  ">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* ---------------- LEFT: SHIPPING + PAYMENT ---------------- */}
            <div className="lg:col-span-2 space-y-5">
              {/* SHIPPING ADDRESS */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="border rounded-md px-4 py-2 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    className="border rounded-md px-4 py-2 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    className="border rounded-md px-4 py-2 outline-none md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="border rounded-md px-4 py-2 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    className="border rounded-md px-4 py-2 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="border rounded-md px-4 py-2 outline-none"
                  />
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      className="accent-primary5"
                    />
                    <span>Cash on Delivery</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      className="accent-primary5"
                    />
                    <span>UPI / Card / Net Banking</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ---------------- RIGHT: ORDER SUMMARY ---------------- */}
            <div className="bg-white p-6 rounded-lg shadow h-fit">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 text-sm">
                {/* PRODUCT */}
                <div className="flex gap-4">
                  <img
                    src="/images/dummy/dummy3.png"
                    alt="Product"
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">Premium Polo Shirt</p>
                    <p className="text-xs text-gray-500">
                      Color: Navy Blue | Size: L
                    </p>
                    <p className="font-semibold mt-1">₹34</p>
                  </div>
                </div>

                <hr />

                <div className="flex justify-between">
                  <span>₹{subtotal}</span>
                  <span>₹34</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold">Free</span>
                </div>

                {discount> 0 && <hr />}
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
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm w-full inline-block text-center mt-6 cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
