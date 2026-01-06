import { create } from "zustand";
import { currentUserApi } from "../utils/userApi";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthChecked: false, // 👈 NEW

  setUser: (user) =>
    set({ user }),

  setAuthChecked: () =>
    set({ isAuthChecked: true }),
  fetchCurrentUser: async () => {
    try {
      const res = await currentUserApi();
      console.log("res", res.data);

      set({ user: res.data });
      return res.data; // Return user data
    } catch {
      // const token = localStorage.getItem("accessToken");

      if (!token) {
        set({ user: null, isAuthChecked: true });
      } else {
        // token exists but API failed → logout
        // localStorage.removeItem("accessToken");
        set({ user: null, isAuthChecked: true });
      }
      return null;
    }
  },
  logout: () => {
    // localStorage.removeItem("accessToken");
    set({
      user: null,
      isAuthChecked: true,
    });
  },
}));
