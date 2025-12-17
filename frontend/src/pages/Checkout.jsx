import React from "react";

const Checkout = () => {
  return (
    <div className="container mx-auto px-4 py-10 mt-35">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ---------------- LEFT: SHIPPING + PAYMENT ---------------- */}
        <div className="lg:col-span-2 space-y-6">
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
              <span>Subtotal</span>
              <span>₹34</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>

            <hr />

            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>₹34</span>
            </div>
          </div>

          <button className="mt-6 w-full py-3 bg-primary5 text-white rounded-lg font-semibold hover:opacity-90 transition">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
