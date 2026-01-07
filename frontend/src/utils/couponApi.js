import axios from "axios";

export const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

/* ================= USER COUPON APIs ================= */

// Get all active coupons
export const getActiveCouponsApi = async () => {
  try {
    const res = await API.get("/coupons/active");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Validate a coupon
export const validateCouponApi = async (couponData) => {
  try {
    const res = await API.post("/coupons/validate", couponData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Mark coupon as used (after successful order)
export const markCouponAsUsedApi = async (couponData) => {
  try {
    const res = await API.post("/coupons/mark-used", couponData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/* ================= ADMIN COUPON APIs ================= */

// Create a new coupon
export const createCouponApi = async (couponData) => {
  try {
    const res = await API.post("/coupons", couponData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get all coupons (admin)
export const getAllCouponsApi = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await API.get(`/coupons/admin/all?${queryParams}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get coupon by ID (admin)
export const getCouponByIdApi = async (id) => {
  try {
    const res = await API.get(`/coupons/admin/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Update a coupon
export const updateCouponApi = async (id, couponData) => {
  try {
    const res = await API.put(`/coupons/${id}`, couponData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Delete a coupon
export const deleteCouponApi = async (id) => {
  try {
    const res = await API.delete(`/coupons/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
