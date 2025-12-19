import React, { useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Common/Banner";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Premium Polo Shirt",
      price: 34,
      image: "/images/dummy/dummy3.png",
      color: { name: "Navy Blue", hex: "#002855" },
      size: "L",
      quantity: 1,
    },
    {
      id: 2,
      title: "Premium Polo Shirt",
      price: 34,
      image: "/images/dummy/dummy3.png",
      color: { name: "Navy Blue", hex: "#002855" },
      size: "L",
      quantity: 1,
    },
  ]);
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const updateQty = (id, value) => {
    const qty = Math.max(1, Number(value) || 1);

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  return (
    <div className="md:mt-35 mt-30">
      <Banner pageTitle="Cart" />
      <div className="container mx-auto px-5 py-5 md:py-20">
        <h3 className="md:text-3xl text-xl font-semibold mb-5 md:mb-15 text-center">
          Shopping Cart
        </h3>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ---------------- CART ITEMS ---------------- */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow h-fit">
            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b text-sm font-medium border-primary5/20">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 px-6 py-6 items-center border-b last:border-none border-primary5/20"
              >
                {/* PRODUCT */}
                <div className="col-span-6 flex gap-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className=" hover:text-red-500 text-xl cursor-pointer hover:scale-130 transition-all duration-500"
                  >
                    ×
                  </button>

                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded-md"
                  />

                  <div className="space-y-1 text-primary5">
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm ">
                      Color: {item.color.name}
                    </p>
                    <p className="text-sm ">Size: {item.size}</p>
                    <p className="text-sm ">
                      Delivery: 5 to 7 business days
                    </p>
                  </div>
                </div>

                {/* PRICE */}
                <div className="col-span-2 text-center font-semibold">
                  ₹{item.price}
                </div>

                {/* QUANTITY */}
                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center bg-primary3 rounded-full overflow-hidden p-1">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="px-3 py-1 text-lg cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, e.target.value)}
                      className="w-12 text-center outline-none bg-transparent"
                    />

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="px-3 py-1 text-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="col-span-2 text-right font-semibold">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* ---------------- PRICE SUMMARY ---------------- */}
          <div className="bg-white p-6 rounded-lg shadow h-fit w-full sticky top-35">
            <h4 className="text-lg font-semibold mb-4">Price Details</h4>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold">Free</span>
              </div>

              <hr className="text-primary5/20"/>

              <div className="flex justify-between font-semibold text-base text-primary5">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <Link
              className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm w-full inline-block text-center"
              to="/checkout"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
