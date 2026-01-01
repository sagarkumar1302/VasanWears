import axios from "axios";
export const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});

export const getCartApi = async () => {
    try {
        const res = await API.get("/cart");
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const addToCartApi = async ({
    productId,
    colorId,
    sizeId,
    colorName,
    sizeName,
    designImages,
    designData,
    quantity,
}) => {
    try {
        const res = await API.post("/cart/add", {
            productId,
            colorId,
            sizeId,
            colorName,
            sizeName,
            designImages,
            designData,
            quantity,
        });

        return res.data;
    } catch (err) {
        throw err;
    }
};

export const removeFromCartApi = async (itemId) => {
    try {
        const res = await API.delete(`/cart/remove/${itemId}`);
        return res.data;
    }
    catch (err) {
        throw err;
    }
};
export const clearCartApi = async () => {
    try {
        const res = await API.delete("/cart/clear");
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const updateCartItemApi = async (itemId, quantity) => {
    try {
        const res = await API.delete(`/cart/update/${itemId}`, { data: { quantity } });
        return res.data;
    } catch (err) {
        throw err;
    }
};

// Google Login API call
