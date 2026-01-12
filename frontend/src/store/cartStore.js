import { create } from "zustand";
import {
  getCartApi,
  updateCartItemApi,
  removeFromCartApi,
} from "../utils/cartApi";

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  totalQty: 0,
  loading: false,

  /* ================= FETCH CART ================= */
  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await getCartApi();
      const cart = res.data || { items: [], subtotal: 0 };

      const totalQty = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      set({
        items: cart.items,
        subtotal: cart.subtotal,
        totalQty,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  /* ================= UPDATE QTY ================= */
  updateQty: async (itemId, quantity) => {
    if (quantity < 1) return;

    set((state) => {
      const updatedItems = state.items.map((i) =>
        i._id === itemId ? { ...i, quantity } : i
      );

      return {
        items: updatedItems,
        subtotal: updatedItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        ),
      };
    });

    try {
      await updateCartItemApi(itemId, quantity);
      await get().fetchCart();
    } catch {
      await get().fetchCart();
    }
  },

  getItemDisplayData: (item) => {
    if (item.itemType === "custom") {
      return {
        title: item.design?.title || "Custom Design",
        image: item.design?.images?.front,
        price: item.price,
      };
    }

    return {
      title: item.product?.title,
      image: item.product?.featuredImage,
      price: item.price,
    };
  },

  /* ================= REMOVE ITEM ================= */
  removeItem: async (itemId) => {
    // Optimistic remove
    set((state) => ({
      items: state.items.filter((i) => i._id !== itemId),
      subtotal: state.items
        .filter((i) => i._id !== itemId)
        .reduce((sum, i) => sum + i.price * i.quantity, 0),
    }));

    try {
      await removeFromCartApi(itemId);
      await get().fetchCart();
    } catch {
      await get().fetchCart();
    }
  },

  clearLocalCart: () =>
    set({
      items: [],
      subtotal: 0,
      totalQty: 0,
    }),
}));
