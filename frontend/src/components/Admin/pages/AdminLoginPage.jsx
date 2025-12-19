import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useAdminAuthStore } from "../../../store/useAdminAuthStore";
import { useNavigate } from "react-router-dom";
import { adminLoginUser } from "../../../utils/adminApi";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fetchCurrentUser = useAdminAuthStore((state) => state.fetchCurrentUser);
  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      await adminLoginUser(email, password);
      await fetchCurrentUser();

      toast.success("Login Successful! 🎉");

      // Wait 1.5 seconds before navigating
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      toast.error("Invalid credentials! ❌");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 px-4">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={loginHandler}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                value={password}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
              />
              Remember me
            </label>

            <a
              href="#"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 text-white 
            font-semibold hover:bg-indigo-700 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} Admin Panel
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
