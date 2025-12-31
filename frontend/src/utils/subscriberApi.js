import axios from "axios";
export const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});
export const subscribeNewsletterApi = async (email) => {
    try {
        const res = await API.post("/subscribers/subscribe", {email});
        return res.data;
    } catch (err) {
        console.error("Subscribe Newsletter Error:", err);
        throw err;
    }
};