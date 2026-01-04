import axios from "axios";
import { useAdminAuthStore } from "../store/useAdminAuthStore";
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

export const adminLogout = async () => {
  try {
    const res = await API.post("/admin/logout");
    return res.data;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};

// api.js


export const adminCurrentUserApi = async () => {
  try {
    const res = await API.get("/admin/current-user");
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const adminLoginUser = async (email, password) => {
  try {
    const res = await API.post("/admin/admin-login", { email, password });
    return res.data;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};
export const addCategoryApi = async (formData) => {
  try {
    const res = await API.post("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Add Category Error:", err);
    throw err;
  }
};
export const updateCategoryApi = async (categoryId, formData) => {
  try {
    const res = await API.put(`/categories/${categoryId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Update Category Error:", err);
    throw err;
  }
};
export const deleteCategoryApi = async (categoryId) => {
  try {
    const res = await API.delete(`/categories/${categoryId}`);
    return res.data;
  } catch (err) {
    console.error("Delete Category Error:", err);
    throw err;
  }
};
export const getAllCategoriesWithSubCatApi = async () => {
  try {
    const res = await API.get("/categories/catws");
    return res.data;
  } catch (err) {
    console.error("Get Categories Error:", err);
    throw err;
  }
};
export const getAllCategoriesAdminApi = async () => {
  try {
    const res = await API.get("/categories/");
    return res.data;
  } catch (err) {
    console.error("Get Categories Error:", err);
    throw err;
  }
};

export const addSubCategoryApi = async (categoryId, data) => {
  try {
    const res = await API.post(`/subcategories/${categoryId}`, data);
    return res.data;
  } catch (err) {
    console.error("Add Subcategory Error:", err);
    throw err;
  }
};
export const deleteSubCategoryApi = async (subCategoryId) => {
  try {
    const res = await API.delete(`/subcategories/${subCategoryId}`);
    return res.data;
  } catch (err) {
    console.error("Delete Subcategory Error:", err);
    throw err;
  }
};
export const updateSubCategoryApi = async (subCategoryId, data) => {
  try {
    const res = await API.put(`/subcategories/${subCategoryId}`, data);
    return res.data;
  } catch (err) {
    console.error("Update Subcategory Error:", err);
    throw err;
  }
};
export const getAllProductsAdminApi = async () => {
  try {
    const res = await API.get("/products");
    return res.data;
  } catch (err) {
    console.error("Get Products Error:", err);
    throw err;
  }
};
export const getProductByIdAdminApi = async (id) => {
  try {
    const res = await API.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get Products Error:", err);
    throw err;
  }
};
export const getAllUsersExceptAdminsApi = async () => {
  try {
    const res = await API.get("/admin/all-users");
    return res.data;
  }
  catch (err) {
    console.error("Get Users Error:", err);
    throw err;
  }
};
export const getAllOrdersAdminApi = async () => {
  try {
    const res = await API.get("/orders/admin");
    console.log("All Orders ",res.data);
    
    return res.data;
  } catch (err) {
    console.error("Get Orders Error:", err);
    throw err;
  }
};
export const getOrderByIdAdminApi = async (orderId) => {
  try {
    const res = await API.get(`/orders/admin/${orderId}`);
    return res.data;
  } catch (err) {
    console.error("Get Order Error:", err);
    throw err;
  }
};

export const updateOrderByAdminApi = async (orderId, data) => {
  try {
    const res = await API.put(`/orders/admin/${orderId}`, data);
    return res.data;
  } catch (err) {
    console.error("Update Order Error:", err);
    throw err;
  }
};

// Google Login API call
