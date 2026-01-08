import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiCheckLine } from "@remixicon/react";

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId;

  // 🚫 Prevent direct access / refresh
  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 mt-35">
      <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
        {/* SUCCESS ICON */}
        <div
          className="w-16 h-16 mx-auto rounded-full bg-green-100 
                     flex items-center justify-center mb-4"
        >
          <RiCheckLine className="text-green-600 text-3xl" />
        </div>

        {/* TEXT */}
        <h1 className="text-2xl font-semibold text-primary2">
          Thank You for Your Order!
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Your order has been placed successfully. We’ll notify you once it’s
          shipped.
        </p>

        {/* ORDER INFO */}
        <div className="mt-4 text-sm text-gray-500">
          Order ID:{" "}
          <span className="font-medium text-primary5">
            #{orderId.slice(-8).toUpperCase()}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/my-account/orders")}
            className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer text-center"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary3 
             transition-all duration-300 btn-slide2 md:text-base text-sm cursor-pointer text-center"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
