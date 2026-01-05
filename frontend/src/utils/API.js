import axios from "axios";
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "ACCESS_TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // 👇 CALL REFRESH TOKEN API
        await API.post("/user/refresh-token");

        // 👇 RETRY ORIGINAL REQUEST
        return API(originalRequest);
      } catch (refreshError) {
        // ❌ Refresh token expired → logout
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);