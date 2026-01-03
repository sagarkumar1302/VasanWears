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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res= await API.post("/user/refresh-token");
        if (res.data?.accessToken) {
          localStorage.setItem("accessToken", res.data.data.accessToken);
        }
        return API(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        localStorage.removeItem("accessToken");
        // window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
