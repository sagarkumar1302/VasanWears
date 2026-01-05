import { API } from "./API";
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


