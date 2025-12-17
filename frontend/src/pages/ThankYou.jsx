import React from "react";
import { useNavigate } from "react-router-dom";
import { RiCheckLine } from "@remixicon/react";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 mt-35">
      <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
        {/* SUCCESS ICON */}
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 
                        flex items-center justify-center mb-4">
          <RiCheckLine className="text-green-600 text-3xl" />
        </div>

        {/* TEXT */}
        <h1 className="text-2xl font-semibold text-primary2">
          Thank You for Your Order!
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Your order has been placed successfully.  
          We’ll notify you once it’s shipped.
        </p>

        {/* ORDER INFO */}
        <div className="mt-4 text-sm text-gray-500">
          Order ID: <span className="font-medium">#ORD123456</span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full py-3 bg-primary5 text-white rounded-lg 
                       font-semibold hover:opacity-90 transition"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="w-full py-3 border border-primary5 text-primary5 
                       rounded-lg font-semibold hover:bg-primary1 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
