import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});
export const loginUser = async (email, password) => {
  try {
    const res = await API.post("/user/login", { email, password });
    localStorage.setItem("accessToken", res.data.data.accessToken);
    return res.data;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};
export const logoutUser = async () => {
  try {
    const res = await API.post("/user/logout");
    return res.data;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};
export const googleLoginApi = async (access_token) => {
  try {
    const res = await API.post("/user/google-login", {
      access_token: access_token,
    });
    localStorage.setItem("accessToken", res.data.data.accessToken);
    return res.data;
  } catch (err) {
    console.error("Google Login Error:", err);
    throw err;
  }
};
// api.js

export const currentUserApi = async () => {
  try {
    const res = await API.get("/user/current-user");
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const updateProfileApi = (data) => API.put("/user/update-profile", data);
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop: only retry once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await API.post("/user/refresh-token");
        
        // Extract new access token from response (handle both structures)
        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
        
        if (newAccessToken) {
          // Store the new token
          localStorage.setItem("accessToken", newAccessToken);
          
          // Update the Authorization header for the retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return API(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear token and logout
        localStorage.removeItem("accessToken");
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
