import axios from "axios";
export const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
});

export const placeOrderApi = async (orderData) => {
    try {
        const res = await API.post("/orders/place", orderData);
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const verifyPaymentApi = async (paymentData) => {
    try {
        const res = await API.post("/payments/verify", paymentData);
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const getMyOrdersApi = async () => {
    try {
        const res = await API.get("/orders/my-orders");
        return res.data;
    } catch (err) {
        throw err;
    }
};
export const getOrderByIdApi = async (orderId) => {
    try {
        const res = await API.get(`/orders/${orderId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
};