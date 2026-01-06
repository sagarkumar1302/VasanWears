import axios from "axios";
export const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});
export const createDesignApi = async (designData) => {
    try {
        const res = await API.post("/designs", designData);
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const getMyDesignsApi = async () => {
    try {
        const res = await API.get("/designs/me");
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const getAllDesignsApi = async () => {
    try {
        const res = await API.get("/designs");
        return res.data;
    } catch (err) {
        throw err;
    }
}

export const toggleLikeDesign = async (designId) => {
    try {
        const res = await API.post(`/designs/${designId}/like`);
        return res.data;
    } catch (err) {
        throw err;
    }
}
export const getDesignByIdApi = async (designId) => {
    try {
        const res = await API.get(`/designs/${designId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const getDesignsByUserIdApi = async (userId) => {
    try {
        const res = await API.get(`/designs/user/${userId}`);
        return res.data;
    }
    catch (err) {
        throw err;
    }
};