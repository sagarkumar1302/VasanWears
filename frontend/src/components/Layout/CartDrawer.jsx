import { RiCloseLine } from "@remixicon/react";
import React, { useRef, memo, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import noCart from "../../assets/images/no-cart.gif";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
const CartDrawer = memo(({ setCartDrawer, cartDrawer }) => {
  const drawerRef = useRef(null);
  const timeline = useRef(null);
  const { items, subtotal, loading, updateQty, removeItem } = useCartStore();
  console.log("Cart ",items);
  
  useGSAP(() => {
    if (!drawerRef.current) return;
    
    timeline.current = gsap.timeline({ paused: true });

    timeline.current.fromTo(
      drawerRef.current,
      { x: "100%" }, // completely hidden (right)
      {
        x: "0%", // slide in
        duration: 0.5,
        ease: "power3.out",
      }
    );
    if (items?.length === 0) {
      timeline.current.from(
        ".no-cart img",
        {
          opacity: 0,
          x: 30,
          duration: 0.25,
        },
        "-=0.1"
      );
      timeline.current.from(".no-cart h4", {
        opacity: 0,
        x: 30,
        duration: 0.25,
      });
      timeline.current.from(".no-cart a", {
        opacity: 0,
        x: 30,
        duration: 0.25,
      });
    } else {
      timeline.current.from(".cartCont", {
        opacity: 0,
        x: 30,
        duration: 0.1,
        stagger: 0.2,
      });
    }
  }, []);

  useGSAP(() => {
    if (!timeline.current) return;
    
    if (cartDrawer) {
      timeline.current.play();
    } else {
      timeline.current.reverse();
    }
  }, [cartDrawer]);

  const handleCloseDrawer = useCallback(() => {
    setCartDrawer(false);
  }, [setCartDrawer]);

  return (
    <>
      {/* OVERLAY */}
      {cartDrawer && (
        <div
          className="fixed h-[calc(100vh)] inset-0 bg-black/40 z-30"
          onClick={handleCloseDrawer}
        ></div>
      )}

      {/* DRAWER */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 xl:w-1/4 md:1/2 w-3/4 bg-white  h-screen z-100 md:z-50 shadow-xl flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b-2 border-slate-500/20 bg-primary3">
          <div className="">
            <h4 className="font-semibold text-lg md:text-xl">Your Cart</h4>
          </div>
          <button
            className="cursor-pointer z-30"
            onClick={handleCloseDrawer}
          >
            <RiCloseLine className="h-8 w-8 text-primary2" />
          </button>
        </div>
        <div className="md:h-[80vh] h-[60vh] overflow-x-hidden overflow-y-auto custom-scroll">
          {loading ? (
            <p className="text-center">Loading cart...</p>
          ) : items.length !== 0 ? (
            <div className="p-4 flex flex-col gap-4 ">
              {items?.map((item) => (
                <div
                  key={item._id}
                  className="border-b border-slate-300/70 py-4 flex gap-4 relative cartCont"
                >
                  {item.itemType === "catalog" ? (
                    /* ================= CATALOG PRODUCT ================= */
                    <>
                      <div className="cartImage">
                        <img
                          src={item.product?.featuredImage}
                          alt={`${item.product?.title} - Cart item`}
                          className="w-20"
                          loading="lazy"
                        />
                      </div>
                      <div className="content flex flex-col">
                        <h5 className="text-sm font-bold md:font-medium md:text-lg">
                          {item.product?.title}
                        </h5>
                        <span className="text-sm">Color: {item.color?.name}</span>

                        <span className="text-sm">Size: {item.size?.name}</span>

                        <span className="text-sm font-bold text-primary5">
                          Price: ₹{item.price}
                        </span>
                        <div className="flex gap-2 items-center mt-2 ">
                          <button
                            className="w-8 py-0.5 bg-primary1 cursor-pointer"
                            onClick={() => updateQty(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <span className="text-sm font-bold">
                            {" "}
                            {item.quantity}
                          </span>
                          <button
                            className="w-8 py-0.5 bg-primary1 cursor-pointer"
                            onClick={() => updateQty(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <button
                            className=" cursor-pointer bg-primary3 rounded-full w-6 h-6 flex items-center justify-center absolute -top-2 md:top-0 right-0"
                            onClick={() => removeItem(item._id)}
                          >
                            <RiCloseLine className="w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* ================= CUSTOM DESIGN ================= */
                    <>
                      <div className="cartImage">
                        <img
                          src={item.design?.images?.front}
                          alt={`${item.design?.title || 'Custom design'} - Cart item`}
                          className="w-20 rounded"
                          loading="lazy"
                        />
                      </div>
                      <div className="content flex flex-col">
                        <h5 className="text-sm font-bold md:font-medium md:text-lg">
                          {item.design?.title || "Custom Designed Product"}
                        </h5>
                        <span className="text-sm">Color: {item.design?.color?.name}</span>

                        <span className="text-sm">Size: {item.design?.size?.name}</span>

                        <span className="text-xs text-primary5/70">Custom Print</span>

                        <span className="text-sm font-bold text-primary5">
                          Price: ₹{item.price}
                        </span>
                        <div className="flex gap-2 items-center mt-2 ">
                          <button
                            className="w-8 py-0.5 bg-primary1 cursor-pointer"
                            onClick={() => updateQty(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <span className="text-sm font-bold">
                            {" "}
                            {item.quantity}
                          </span>
                          <button
                            className="w-8 py-0.5 bg-primary1 cursor-pointer"
                            onClick={() => updateQty(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <button
                            className=" cursor-pointer bg-primary3 rounded-full w-6 h-6 flex items-center justify-center absolute -top-2 md:top-0 right-0"
                            onClick={() => removeItem(item._id)}
                          >
                            <RiCloseLine className="w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center flex-col gap-4 no-cart">
              <img 
                src={noCart} 
                alt="Empty shopping cart illustration" 
                className="w-45 md:w-60"
                loading="lazy"
              />
              <h4 className="text-lg font-semibold">Your cart is empty.🛒</h4>
              <Link
                to="/shop"
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm"
                onClick={handleCloseDrawer}
              >
                Return to Shop
              </Link>
            </div>
          )}
        </div>
        {items?.length > 0 && (
          <div className="p-4 flex flex-col gap-2 border-t border-slate-200/50">
            <div className="flex justify-between items-center py-2 ">
              <span className="text-lg font-medium">Subtotal:</span>
              <span className="text-primary5 font-bold text-xl">
                ₹{subtotal}
              </span>{" "}
            </div>
            <Link
              to="/cart"
              className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary3 
             transition-all duration-300 btn-slide2 md:text-base text-sm cursor-pointer text-center"
              onClick={handleCloseDrawer}
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer text-center"
              onClick={handleCloseDrawer}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
});

export default CartDrawer;
