import React from "react";
import { useNavigate } from "react-router-dom";
import { RiErrorWarningLine } from "@remixicon/react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 mt-35">
      <div className="text-center max-w-md">
        {/* ICON */}
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 
                        flex items-center justify-center mb-6">
          <RiErrorWarningLine className="text-red-500 text-4xl" />
        </div>

        {/* TEXT */}
        <h1 className="text-4xl font-bold text-primary2">404</h1>
        <p className="text-lg font-medium mt-2">Page Not Found</p>
        <p className="text-sm text-gray-500 mt-2">
          The page you are looking for doesn’t exist or was moved.
        </p>

        {/* ACTION */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-primary5 text-white rounded-lg 
                     font-semibold hover:opacity-90 transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
