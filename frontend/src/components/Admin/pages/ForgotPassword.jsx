import { useState } from "react";
import toast from "react-hot-toast";
import { forgetPasswordApi } from "../../../utils/productApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    try {
      setLoading(true);
      await forgetPasswordApi(email);
      toast.success("Reset link sent to your email");
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:py-20 py-5 md:mt-35 mt-30 px-5  flex items-center justify-center bg-gray-50">
      <div className="container mx-auto  flex justify-center items-center">
        <div className="shadow-md rounded-lg p-8 bg-white">
          <h2 className="text-2xl font-semibold text-primary5 text-center mb-4">
            Forgot Password
          </h2>
          <p className="text-sm text-primary5 text-center mb-6">
            Enter your registered email. We’ll send you a reset link.
          </p>

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer w-full"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
