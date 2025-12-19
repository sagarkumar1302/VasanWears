import { create } from "zustand";
import { adminCurrentUserApi } from "../utils/adminApi";

export const useAdminAuthStore = create((set) => ({
  user: null,
  isAuthChecked: false, // 👈 NEW

  setUser: (user) =>
    set({ user }),

  setAdminAuthChecked: () =>
    set({ isAuthChecked: true }),
  fetchCurrentUser: async () => {
    try {
      const res = await adminCurrentUserApi();
      console.log("res", res.data);

      set({ user: res.data });
    } catch {
      set({ user: null });
    }
  },
  adminLogoutAuth: () =>
    set({
      user: null,
      isAuthChecked: true,
    }),
}));
