import axios from "axios";
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});
export const getCategoryByIdApi = async (categoryId) => {
  try {
    const res = await API.get(`/categories/${categoryId}`);
    return res.data;
  } catch (err) {
    console.error("Get Category Error:", err);
    throw err;
  }
};