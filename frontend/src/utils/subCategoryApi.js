import axios from "axios";
import { useAdminAuthStore } from "../store/useAdminAuthStore";
export const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});
export const getSubcategoryByIdApi = async (subCategoryId) => {
    try {
        const res = await API.get(`/subcategories/${subCategoryId}`);
        return res.data;
    } catch (err) {
        console.error("Get SubCategory Error:", err);
        throw err;
    }
};
export const getAllSubCategoriesApi = async () => {
    try {
        const res = await API.get("/subcategories");
        return res.data;
    } catch (err) {
        console.error("Get All SubCategories Error:", err);
        throw err;
    }
};