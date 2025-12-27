import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { resetPasswordApi } from "../../../utils/productApi";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      await resetPasswordApi(token, password);
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:mt-35 mt-30 md:py-20 p-5 flex items-center justify-center bg-gray-50 px-5">
      <div className="container mx-auto flex items-center justify-center">
        <div className=" bg-white shadow-md rounded-lg p-8 md:w-3xl w-full">
          <h2 className="text-2xl font-semibold text-primary5 text-center mb-2">
            Reset Password
          </h2>
          <p className="text-sm text-primary5 text-center mb-6">
            Enter a new password for your account
          </p>

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            <p className="text-xs text-gray-500">
              Password should be at least 6 characters long.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer w-full"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
