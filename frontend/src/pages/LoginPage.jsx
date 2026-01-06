import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/useAuthStore";
import {
  googleLoginApi,
  loginUser,
  updateUserProfileApi,
} from "../utils/userApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    gender: "",
    phoneNumber: "",
  });
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const setUser = useAuthStore((state) => state.setUser);

  // Check if user needs to complete profile
  const checkUserProfileComplete = (user) => {
    if (!user) return false;
    const hasGender = user.gender && user.gender.trim() !== "";
    const hasPhone = user.phoneNumber && user.phoneNumber.trim() !== "";
    console.log("Profile check:", { hasGender, hasPhone, user });
    return hasGender && hasPhone;
  };

  // Handle additional info submission
  const handleAdditionalInfoSubmit = async (e) => {
    e.preventDefault();

    if (!additionalInfo.gender || additionalInfo.gender.trim() === "") {
      toast.error("Please select your gender");
      return;
    }

    if (
      !additionalInfo.phoneNumber ||
      additionalInfo.phoneNumber.length !== 10
    ) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("gender", additionalInfo.gender);
      formData.append("phoneNumber", additionalInfo.phoneNumber);

      const response = await updateUserProfileApi(formData);
      setUser(response.data);

      toast.success("Profile completed successfully! 🎉");
      setShowAdditionalInfo(false);
      navigate("/my-account");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    }
  };

  // Login with email/password
  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      await loginUser(email, password);
      const currentUser = await fetchCurrentUser();

      toast.success("Login Successful! 🎉");
      console.log("Current User ",currentUser);
      
      // Check if profile is complete
      if (!checkUserProfileComplete(currentUser)) {
        setShowAdditionalInfo(true);
      } else {
        navigate("/my-account");
      }
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
        const currentUser = await fetchCurrentUser();

        toast.success("Google Login Successful! 🎉");
        console.log("Current User ",currentUser);
        // Check if profile is complete
        if (!checkUserProfileComplete(currentUser)) {
          setShowAdditionalInfo(true);
        } else {
          navigate("/my-account");
        }
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
        {showAdditionalInfo ? (
          /* Additional Info Form */
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Please provide additional information
            </p>

            <form onSubmit={handleAdditionalInfoSubmit} className="space-y-5">
              {/* Gender */}
              <div>
                <label className="text-gray-700 font-medium">Gender *</label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={additionalInfo.gender === "male"}
                      onChange={(e) =>
                        setAdditionalInfo({
                          ...additionalInfo,
                          gender: e.target.value,
                        })
                      }
                      className="w-4 h-4 accent-primary5"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={additionalInfo.gender === "female"}
                      onChange={(e) =>
                        setAdditionalInfo({
                          ...additionalInfo,
                          gender: e.target.value,
                        })
                      }
                      className="w-4 h-4 accent-primary5"
                    />
                    <span>Female</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={additionalInfo.gender === "other"}
                      onChange={(e) =>
                        setAdditionalInfo({
                          ...additionalInfo,
                          gender: e.target.value,
                        })
                      }
                      className="w-4 h-4 accent-primary5"
                    />
                    <span>Other</span>
                  </label>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-gray-700 font-medium">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={additionalInfo.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setAdditionalInfo({
                        ...additionalInfo,
                        phoneNumber: value,
                      });
                    }
                  }}
                  maxLength={10}
                  className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary5 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {additionalInfo.phoneNumber.length}/10 digits
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary2
                 transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer"
              >
                Complete Profile
              </button>
            </form>
          </div>
        ) : (
          /* Login Form */
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
        )}
      </div>
    </div>
  );
};

export default LoginPage;
