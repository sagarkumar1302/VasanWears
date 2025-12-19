import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4500/api",
  withCredentials: true,
});

export const adminLogout = async () => {
  try {
    const res = await API.post("/admin/logout");
    return res.data;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};

// api.js


export const adminCurrentUserApi = async () => {
  try {
    const res = await API.get("/admin/current-user");
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const adminLoginUser = async (email, password) => {
  try {
    const res = await API.post("/admin/admin-login", { email, password });
    return res.data;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};
API.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await API.post("/admin/refresh-token");
        return API(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);


// Google Login API call
