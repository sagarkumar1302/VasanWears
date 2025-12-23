import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import AdminDashboard from "./components/Admin/pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ShopPage from "./pages/ShopPage";
import SingleProductPage from "./pages/SingleProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyAccount from "./pages/MyAccount";
import ProtectedRoute from "./components/components/ProtectedRoute";
import ProfileInformation from "./components/Common/ProfileInformation";
import ManageAddress from "./components/Common/ManageAddress";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { currentUserApi } from "./utils/userApi";
import PublicRoute from "./components/components/PublicRoute";
import MyAccountRightSide from "./components/Common/MyAccountRightSide";
import Designer from "./pages/Designer";
import Orders from "./components/Common/Orders";
import SingleOrder from "./components/Common/SingleOrder";
import Wishlist from "./pages/WishList";
import Coupons from "./components/Common/Coupon";
import ScrollToHash from "./components/components/ScrollToHash";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import { BlogsPage } from "./pages/BlogsPage";
import { SingleBlogPage } from "./pages/SingleBlogPage";
import AutoScrollToTop from "./components/Common/AutoScrollToTop";
import AdminLayout from "./components/Admin/layout/AdminLayout";
import AdminLoginPage from "./components/Admin/pages/AdminLoginPage";
import AdminPublicRoute from "./components/components/AdminPublicRoute";
import AdminProtectedRoute from "./components/components/AdminProtectedRoute";
import { useAdminAuthStore } from "./store/useAdminAuthStore";
import { adminCurrentUserApi } from "./utils/adminApi";
import AdminProductList from "./components/Admin/pages/AdminProductList";
import EditProduct from "./components/Admin/pages/EditProduct";
import AddProduct from "./components/Admin/pages/AddProduct";
import AdminCategory from "./components/Admin/pages/AdminCategory";
import SizePage from "./components/Admin/pages/SizePage";
import ColorPage from "./components/Admin/pages/ColorPage";
const App = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthChecked = useAuthStore((s) => s.setAuthChecked);
  const setAdminAuthChecked = useAdminAuthStore((s) => s.setAdminAuthChecked);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userRes = await currentUserApi();
        setUser(userRes.data);
      } catch {}

      try {
        const adminRes = await adminCurrentUserApi();
        useAdminAuthStore.getState().setUser(adminRes.data);
      } catch {}

      setAuthChecked();
      setAdminAuthChecked();
    };

    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <AutoScrollToTop />
      <ScrollToHash />
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:blogId" element={<SingleBlogPage />} />
          <Route path="*" element={<NotFound />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/design" element={<Designer />}></Route>
            <Route path="/cart" element={<CartPage />}></Route>
            <Route path="/wishlist" element={<Wishlist />}></Route>
            <Route path="/checkout" element={<Checkout />}></Route>
            <Route path="/thank-you" element={<ThankYou />}></Route>
            <Route path="/my-account" element={<MyAccount />}>
              <Route
                path="profile-information"
                element={<ProfileInformation />}
              />
              <Route path="addresses" element={<ManageAddress />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<SingleOrder />} />
              <Route path="coupons" element={<Coupons />} />
              <Route index element={<MyAccountRightSide />} />
            </Route>
          </Route>

          <Route path="/shop/:id/:name" element={<SingleProductPage />} />
        </Route>{" "}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        {/* //Admin Layout */}
        <Route element={<AdminPublicRoute />}>
          <Route path="/admin-login" element={<AdminLoginPage />} />
        </Route>
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products">
              <Route path="all-products" element={<AdminProductList />} />
              <Route path="add" element={<AddProduct />} />
              <Route path=":productId/edit" element={<EditProduct />} />
              <Route path="category" element={<AdminCategory />} />
              <Route path="sizes" element={<SizePage />} />
              <Route path="color" element={<ColorPage />} />
            </Route>

            {/* <Route path="products" element={<Products />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
