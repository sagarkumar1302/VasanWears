import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Common/Banner";
import { useCartStore } from "../store/cartStore";
import Loader from "../components/Common/Loader";

const CartPage = () => {
  const { items, subtotal, loading, fetchCart, updateQty, removeItem } =
    useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="md:mt-35 mt-30">
      <Banner pageTitle="Cart" />

      <div className="container mx-auto px-5 py-5 md:py-20">
        <h3 className="md:text-3xl text-xl font-semibold mb-5 md:mb-15 text-center">
          Shopping Cart
        </h3>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium mb-4">Your cart is empty 🛒</p>
            <Link
              to="/shop"
              className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
              transition-all duration-300 btn-slide inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
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

              {items.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-12 px-6 py-6 items-center border-b last:border-none border-primary5/20"
                >
                  {/* PRODUCT */}
                  <div className="col-span-6 flex gap-4">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-xl cursor-pointer hover:text-red-500 transition"
                    >
                      ×
                    </button>
                    {item.itemType === "catalog" ? (
                      <Link
                        to={`/shop/${item.product?._id}/${item.product?.slug}?variant=${item.variant}&size=${item.size?._id}`}
                        className="flex gap-4"
                      >
                        <img
                          src={item.product?.featuredImage}
                          alt={item.product?.title}
                          className="w-20 h-24 object-cover rounded-md"
                        />

                        <div className="space-y-1 text-primary5">
                          <h3 className="font-semibold">
                            {item.product?.title}
                          </h3>

                          <p className="text-sm">Color: {item.color?.name}</p>
                          <p className="text-sm">
                            Size: {item.size?.name || "Free Size"}
                          </p>
                          <p className="text-sm">Delivery: 5–7 business days</p>
                        </div>
                      </Link>
                    ) : (
                      /* ================= CUSTOM DESIGN ================= */
                      <div className="flex gap-4">
                        <img
                          src={item.design?.images?.front}
                          alt="Custom design"
                          className="w-20 h-24 object-cover rounded-md border"
                        />

                        <div className="space-y-1 text-primary5">
                          <h3 className="font-semibold">
                            {item.design?.title || "Custom Designed Product"}
                          </h3>

                          <p className="text-sm">
                            Color: {item.design?.color?.name}
                          </p>

                          <p className="text-sm">
                            Size: {item.design?.size?.name}
                          </p>

                          <p className="text-sm">Custom Print</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="col-span-2 text-center font-semibold">
                    ₹{item.price}
                  </div>

                  {/* QUANTITY */}
                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center bg-primary3 rounded-full overflow-hidden p-1">
                      <button
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 text-lg cursor-pointer disabled:opacity-40"
                      >
                        −
                      </button>

                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-12 text-center outline-none bg-transparent"
                      />

                      <button
                        onClick={() => updateQty(item._id, item.quantity + 1)}
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

                <hr className="text-primary5/20" />

                <div className="flex justify-between font-semibold text-base text-primary5">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <Link
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
                transition-all duration-300 btn-slide w-full inline-block text-center"
                to="/checkout"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
