import React from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-primary3 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        {/* Heading */}
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mt-2">Login to continue</p>

        {/* Form */}
        <form className="mt-8 space-y-5">
          {/* Email */}
          <div>
            <label className="text-gray-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-black" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot" className="text-black font-medium">
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

          {/* Google Login Button */}
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              axios
                .post("http://localhost:4500/api/user/google-login", {
                  idToken: credentialResponse.credential,
                })
                .then((res) => console.log("Logged In →", res.data))
                .catch((err) => console.log(err));
            }}
            onError={() => console.log("Login Failed")}
            
          />
          {/* <button
            type="button"
            className="w-full py-3 border rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            Continue with Google
          </button> */}

          {/* Signup Link */}
          {/* <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-black font-medium">
              Create Account
            </Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
