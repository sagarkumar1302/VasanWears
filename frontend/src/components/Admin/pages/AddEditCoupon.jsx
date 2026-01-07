import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCouponApi,
  getCouponByIdApi,
  updateCouponApi,
} from "../../../utils/couponApi";

const AddEditCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderValue: "",
    startDate: "",
    expiryDate: "",
    usageLimit: "",
    perUserLimit: "1",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const response = await getCouponByIdApi(id);
      const coupon = response.data;

      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount || "",
        minOrderValue: coupon.minOrderValue || "",
        startDate: coupon.startDate?.split("T")[0] || "",
        expiryDate: coupon.expiryDate?.split("T")[0] || "",
        usageLimit: coupon.usageLimit || "",
        perUserLimit: coupon.perUserLimit || "1",
        isActive: coupon.isActive,
      });
    } catch (error) {
      console.error("Error fetching coupon:", error);
      alert("Failed to fetch coupon details");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.code ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.expiryDate
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.expiryDate)) {
      alert("Start date must be before expiry date");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : undefined,
        minOrderValue: formData.minOrderValue
          ? Number(formData.minOrderValue)
          : 0,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        perUserLimit: Number(formData.perUserLimit),
        isActive: formData.isActive,
      };

      if (isEdit) {
        await updateCouponApi(id, payload);
        alert("Coupon updated successfully");
      } else {
        await createCouponApi(payload);
        alert("Coupon created successfully");
      }

      navigate("/admin/coupons");
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary5 mb-6">
          {isEdit ? "Edit Coupon" : "Add New Coupon"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Coupon Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent uppercase"
              placeholder="e.g., SAVE20"
              required
              disabled={isEdit}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
              rows="3"
              placeholder="Optional description for internal use"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                required
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                placeholder={
                  formData.discountType === "PERCENTAGE" ? "e.g., 20" : "e.g., 100"
                }
                min="0"
                step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                required
              />
            </div>
          </div>

          {/* Max Discount & Min Order */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Discount Amount (₹)
              </label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                placeholder="Optional, for percentage coupons"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per User Limit *
              </label>
              <input
                type="number"
                name="perUserLimit"
                value={formData.perUserLimit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary5 focus:border-transparent"
                placeholder="1"
                min="1"
                required
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-primary5 border-gray-300 rounded focus:ring-primary5"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (users can use this coupon)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-primary5 text-white py-2 px-4 rounded-lg hover:bg-primary5/90 transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Coupon"
                : "Create Coupon"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/coupons")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCoupon;
