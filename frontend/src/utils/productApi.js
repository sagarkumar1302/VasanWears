import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});

export const createProductApi = async (formData) => {
    try {
        const res = await API.post("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    } catch (err) {
        console.error("Create Product Error:", err);
        throw err;
    }
};
export const getAllColorsApi = async () => {
    try {
        const res = await API.get("/colors");
        return res.data;
    }
    catch (err) {
        console.error("Get All Colors Error:", err);
        throw err;
    }
};

export const getAllSizesApi = async () => {
    try {
        const res = await API.get("/sizes");
        return res.data;
    }
    catch (err) {
        console.error("Get All Sizes Error:", err);
        throw err;
    }
};
export const createColorApi = async (colorData) => {
    try {
        const res = await API.post("/colors", colorData);  
        return res.data;
    } catch (err) {
        console.error("Create Color Error:", err);
        throw err;
    }
};

export const createSizeApi = async (sizeData) => {
    try {
        const res = await API.post("/sizes", sizeData);  
        return res.data;
    } catch (err) {
        console.error("Create Size Error:", err);
        throw err;
    }
};
export const updateColorsApi = async (colorId, colorData) => {
    try {
        const res = await API.put(`/colors/${colorId}`, colorData); 
        return res.data;
    } catch (err) {
        console.error("Update Color Error:", err);
        throw err;
    }  
};

export const updateSizesApi = async (sizeId, sizeData) => {
    try {
        const res = await API.put(`/sizes/${sizeId}`, sizeData);
        return res.data;
    } catch (err) {
        console.error("Update Size Error:", err);
        throw err;
    }
};

export const deleteColorApi = async (colorId) => {
    try {
        const res = await API.delete(`/colors/${colorId}`); 
        return res.data;
    } catch (err) {
        console.error("Delete Color Error:", err);
        throw err;
    }  
};
export const deleteSizeApi = async (sizeId) => {
    try {
        const res = await API.delete(`/sizes/${sizeId}`);  
        return res.data;
    } catch (err) {
        console.error("Delete Size Error:", err);
        throw err;
    }
};
export const getProductBySlugApi = async (slug) => {
  try {
    const res = await API.get(`/products/slug/${slug}`);
    return res.data;
  }
    catch (err) {
    console.error("Get Product By Slug Error:", err);
    throw err;
  }
};