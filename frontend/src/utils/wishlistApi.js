import axios from "axios";
export const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});

export const toggleWishlistApi = async (productId) => {
    try {
        const res = await API.post("/wishlist/toggle", {
            productId,
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const getWishlistApi = async () => {
    const res = await API.get("/wishlist");
    return res.data;
};




// Google Login API call
