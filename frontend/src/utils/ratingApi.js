import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/ratings`,
  withCredentials: true,
});

// Add Authorization header to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Create a new rating/review
 */
export const createRatingApi = async (data) => {
  try {
    const res = await API.post("/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Create Rating Error:", err);
    throw err;
  }
};

/**
 * Get all ratings for a product
 */
export const getProductRatingsApi = async (productId, page = 1, limit = 10) => {
  try {
    const res = await API.get(`/product/${productId}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    console.error("Get Product Ratings Error:", err);
    throw err;
  }
};

/**
 * Get current user's ratings
 */
export const getMyRatingsApi = async (page = 1, limit = 10) => {
  try {
    const res = await API.get("/my-ratings", {
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    console.error("Get My Ratings Error:", err);
    throw err;
  }
};

/**
 * Get a single rating by ID
 */
export const getRatingByIdApi = async (id) => {
  try {
    const res = await API.get(`/single/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get Rating Error:", err);
    throw err;
  }
};

/**
 * Update a rating
 */
export const updateRatingApi = async (id, data) => {
  try {
    const res = await API.put(`/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Update Rating Error:", err);
    throw err;
  }
};

/**
 * Delete a rating
 */
export const deleteRatingApi = async (id) => {
  try {
    const res = await API.delete(`/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete Rating Error:", err);
    throw err;
  }
};

/**
 * Check if user can rate a product
 */
export const checkRatingEligibilityApi = async (productId) => {
  try {
    const res = await API.get(`/check/${productId}`);
    return res.data;
  } catch (err) {
    console.error("Check Rating Eligibility Error:", err);
    throw err;
  }
};

/**
 * Admin: Approve/reject a rating
 */
export const toggleRatingApprovalApi = async (id, isApproved) => {
  try {
    const res = await API.put(`/${id}/approve`, { isApproved });
    return res.data;
  } catch (err) {
    console.error("Toggle Rating Approval Error:", err);
    throw err;
  }
};
