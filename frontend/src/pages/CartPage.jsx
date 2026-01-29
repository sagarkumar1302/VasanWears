import React, { useEffect, memo, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Common/Banner";
import { useCartStore } from "../store/cartStore";
import { getAllSizesForWebsite } from "../utils/productApi";
import Loader from "../components/Common/Loader";

const CartPage = memo(() => {
  const {
    items,
    subtotal,
    loading,
    fetchCart,
    updateQty,
    removeItem,
    updateSize,
  } = useCartStore();

  const [sizesList, setSizesList] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllSizesForWebsite();
        const sizes = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) setSizesList(sizes);
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
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
              {/* Header - Hidden on mobile */}
              <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b text-sm font-medium border-primary5/20">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => (
                <div
                  key={item._id}
                  className="px-4 md:px-6 py-4 md:py-6 border-b last:border-none border-primary5/20"
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 items-center">
                    {/* PRODUCT */}
                    <div className="col-span-6 flex gap-4">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-xl cursor-pointer hover:text-red-500 transition"
                      >
                        ×
                      </button>
                      <div className="flex gap-4">
                        {item.itemType === "catalog" ? (
                          <>
                            <Link
                              to={`/shop/${item.product?._id}/${item.product?.slug}?variant=${item.variant}&size=${item.size?._id}`}
                              className="flex gap-4"
                              tabIndex={-1}
                              onClick={(e) =>
                                e.target.tagName === "SELECT" &&
                                e.preventDefault()
                              }
                            >
                              <img
                                src={
                                  item.variantData?.featuredImage ||
                                  item.product?.featuredImage
                                }
                                alt={item.product?.title || "Product"}
                                loading="lazy"
                                className="w-20 h-24 object-cover rounded-md"
                              />
                            </Link>
                            <div className="space-y-1 text-primary5">
                              <Link
                                to={`/shop/${item.product?._id}/${item.product?.slug}?variant=${item.variant}&size=${item.size?._id}`}
                                className="flex gap-4"
                                tabIndex={-1}
                                onClick={(e) =>
                                  e.target.tagName === "SELECT" &&
                                  e.preventDefault()
                                }
                              >
                                <h3 className="font-semibold">
                                  {item.product?.title}
                                </h3>
                              </Link>
                              <p className="text-sm">
                                Color: {item.color?.name}
                              </p>
                              <p className="text-sm">
                                Size:{" "}
                                <select
                                  value={item.size?._id || ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    updateSize(item._id, e.target.value, item.quantity)
                                  }
                                  className="text-sm bg-transparent"
                                >
                                  <option value="">Free Size</option>
                                  {sizesList.map((s) => (
                                    <option key={s._id} value={s._id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              </p>
                              <p className="text-sm">
                                Delivery: 5–7 business days
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <img
                              src={item.design?.images?.front}
                              alt={item.design?.title || "Custom design"}
                              loading="lazy"
                              className="w-20 h-24 object-cover rounded-md "
                            />

                            <div className="space-y-1 text-primary5">
                              <h3 className="font-semibold">
                                {item.design?.title ||
                                  "Custom Designed Product"}
                              </h3>

                              <p className="text-sm">
                                Color: {item.design?.color?.name}
                              </p>

                              <p className="text-sm">
                                Size:{" "}
                                <select
                                  value={item.design?.size?._id || ""}
                                  onChange={(e) =>
                                    updateSize(item._id, e.target.value, item.quantity)
                                  }
                                  className="text-sm bg-transparent"
                                >
                                  <option value="">Free Size</option>
                                  {sizesList.map((s) => (
                                    <option key={s._id} value={s._id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              </p>

                              <p className="text-sm">Custom Print</p>
                            </div>
                          </>
                        )}
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

                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex gap-3 mb-3">
                      {item.itemType === "catalog" ? (
                        <Link
                          to={`/shop/${item.product?._id}/${item.product?.slug}?variant=${item.variant}&size=${item.size?._id}`}
                          className="flex gap-3 flex-1"
                        >
                          <img
                            src={
                              item.variantImage || item.product?.featuredImage
                            }
                            alt={item.product?.title || "Product"}
                            loading="lazy"
                            className="w-20 h-24 object-cover rounded-md flex-shrink-0"
                          />

                          <div className="space-y-1 text-primary5 flex-1">
                            <h3 className="font-semibold text-sm">
                              {item.product?.title}
                            </h3>

                            <p className="text-xs">Color: {item.color?.name}</p>
                            <p className="text-xs">
                              Size:{" "}
                              {item.itemType === "catalog" ? (
                                <select
                                  value={item.size?._id || ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    updateSize(item._id, e.target.value, item.quantity)
                                  }
                                  className="text-xs bg-transparent"
                                >
                                  <option value="">Free Size</option>
                                  {sizesList.map((s) => (
                                    <option key={s._id} value={s._id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <select
                                  value={item.design?.size?._id || ""}
                                  onChange={(e) =>
                                    updateSize(item._id, e.target.value, item.quantity)
                                  }
                                  className="text-xs bg-transparent"
                                >
                                  <option value="">Free Size</option>
                                  {sizesList.map((s) => (
                                    <option key={s._id} value={s._id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </p>
                            <p className="text-xs">
                              Delivery: 5–7 business days
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex gap-3 flex-1">
                          <img
                            src={item.design?.images?.front}
                            alt={item.design?.title || "Custom design"}
                            loading="lazy"
                            className="w-20 h-24 object-cover rounded-md  shrink-0"
                          />

                          <div className="space-y-1 text-primary5 flex-1">
                            <h3 className="font-semibold text-sm">
                              {item.design?.title || "Custom Designed Product"}
                            </h3>

                            <p className="text-xs">
                              Color: {item.design?.color?.name}
                            </p>

                            <p className="text-xs">
                              Size: {item.design?.size?.name}
                            </p>

                            <p className="text-xs">Custom Print</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-2xl cursor-pointer hover:text-red-500 transition h-fit"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-primary5/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary5/70">Price:</span>
                        <span className="font-semibold">₹{item.price}</span>
                      </div>

                      <div className="flex items-center bg-primary3 rounded-full overflow-hidden p-0.5">
                        <button
                          onClick={() => updateQty(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-0.5 text-lg cursor-pointer disabled:opacity-40"
                        >
                          −
                        </button>

                        <input
                          type="text"
                          value={item.quantity}
                          readOnly
                          className="w-10 text-center outline-none bg-transparent text-sm"
                        />

                        <button
                          onClick={() => updateQty(item._id, item.quantity + 1)}
                          className="px-2.5 py-0.5 text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary5/70">Total:</span>
                        <span className="font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
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
});

export default CartPage;
