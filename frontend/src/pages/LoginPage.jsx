import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/useAuthStore";
import { googleLoginApi, loginUser } from "../utils/userApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ Import toast

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  // Login with email/password
  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      await loginUser(email, password);
      await fetchCurrentUser();

      toast.success("Login Successful! 🎉");

      // Wait 1.5 seconds before navigating
      setTimeout(() => {
        navigate("/my-account");
      }, 400);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      toast.error("Invalid credentials! ❌");
    }
  };

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (googleResponse) => {
      try {
        await googleLoginApi(googleResponse.access_token);
        await fetchCurrentUser();

        toast.success("Google Login Successful! 🎉");

        setTimeout(() => {
          navigate("/my-account");
        }, 400);
      } catch (err) {
        console.error("Google login failed:", err.response?.data || err);
        toast.error("Google Login Failed! ❌");
      }
    },
    onError: () => {
      toast.error("Google Login Failed! ❌");
    },
  });

  return (
    <div className="min-h-screen bg-primary3 flex md:items-center justify-center px-4 items-start md:py-0 py-10">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <form className="mt-8 space-y-5" onSubmit={loginHandler}>
          {/* Email */}
          <div>
            <label className="text-gray-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-black" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-black font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary2
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer"
          >
            Login
          </button>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full py-3 border rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
