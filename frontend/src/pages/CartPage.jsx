import React from "react";

const cartItems = [
  {
    id: 8,
    title: "Premium Polo Shirt",
    price: 34,
    image: "/images/dummy/dummy3.png",
    color: { name: "Navy Blue", hex: "#002855" },
    size: "L",
    quantity: 1,
  },
];

const CartPage = () => {
  return (
    <div className="container mx-auto px-4 py-10 mt-35">
      <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ---------------- CART ITEMS ---------------- */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white rounded-lg shadow"
            >
              {/* Product Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-28 object-cover rounded-md"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-primary2">
                  {item.title}
                </h3>

                {/* Color & Size */}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Color:</span>
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: item.color.hex }}
                    />
                    <span>{item.color.name}</span>
                  </div>

                  <div>
                    <span>Size:</span>{" "}
                    <span className="font-medium">{item.size}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-4">
                  <button className="w-8 h-8 border rounded">−</button>
                  <span>{item.quantity}</span>
                  <button className="w-8 h-8 border rounded">+</button>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end justify-between">
                <span className="font-semibold text-lg">
                  ₹{item.price}
                </span>
                <button className="text-sm text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- PRICE SUMMARY ---------------- */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-lg font-semibold mb-4">Price Details</h2>

          <div className="space-y-3 text-sm">
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
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
