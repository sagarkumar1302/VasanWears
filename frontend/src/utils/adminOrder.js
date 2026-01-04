import axios from "axios";
import { useAdminAuthStore } from "../store/useAdminAuthStore";
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});
export const getAllOrdersApi = async () => {
  try {
    const res = await API.get("/orders/admin");
    return res.data;
  } catch (err) {
    console.error("Get All Orders Error:", err);
    throw err;
  }
};
export const getOrderByIdApi = async (orderId) => {
  try {
    const res = await API.get(`/orders/admin/${orderId}`);
    return res.data;
  } catch (err) {
    console.error("Get Order By ID Error:", err);
    throw err;
  }
};
