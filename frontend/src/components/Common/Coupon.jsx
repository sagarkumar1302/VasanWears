import React, { useEffect, useState } from "react";
import { RiCoupon3Line, RiFileCopyLine } from "@remixicon/react";
import toast from "react-hot-toast";
import { getActiveCouponsApi } from "../../utils/couponApi";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      setLoading(true);
      const response = await getActiveCouponsApi();
      if (response.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon Copied.");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `Get ${coupon.discountValue}% off${
        coupon.maxDiscountAmount
          ? ` (up to ₹${coupon.maxDiscountAmount})`
          : ""
      }${
        coupon.minOrderValue > 0
          ? ` on minimum purchase of ₹${coupon.minOrderValue}`
          : ""
      }`;
    } else {
      return `Get ₹${coupon.discountValue} off${
        coupon.minOrderValue > 0
          ? ` on minimum purchase of ₹${coupon.minOrderValue}`
          : ""
      }`;
    }
  };

  return (
    <div className="">
      <div className="mx-auto">
        <h2 className="text-xl font-semibold mb-4">Available Coupons</h2>

        {loading ? (
          <div className="bg-white p-8 rounded text-center">
            <p className="text-gray-500">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white p-8 rounded text-center">
            <p className="text-gray-500">No coupons available right now 🎟️</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-primary5/20"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary1/10 text-primary1 p-2 rounded">
                    <RiCoupon3Line size={20} />
                  </div>

                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-sm text-primary5">
                      {coupon.description || getDiscountText(coupon)}
                    </p>
                    <p className="text-xs text-primary5 mt-1 font-semibold">
                      Expires on {formatDate(coupon.expiryDate)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyCode(coupon.code)}
                  className="cursor-pointer border px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-50 border-primary5/20"
                >
                  <RiFileCopyLine />
                  Copy Code
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
