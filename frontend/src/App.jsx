import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
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
import { currentUserApi } from "./utils/api";
import PublicRoute from "./components/components/PublicRoute";
import MyAccountRightSide from "./components/Common/MyAccountRightSide";
import Designer from "./pages/Designer";
import Orders from "./components/Common/Orders";
import SingleOrder from "./components/Common/SingleOrder";
import Wishlist from "./pages/WishList";
import Coupons from "./components/Common/Coupon";
import ScrollToHash from "./components/components/ScrollToHash";

const App = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthChecked = useAuthStore((s) => s.setAuthChecked);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await currentUserApi();
        setUser(res.data);
      } catch {
        // not logged in
      } finally {
        setAuthChecked();
      }
    };

    initAuth();
  }, []);

  return (
    <BrowserRouter>
    <ScrollToHash/>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shop" element={<ShopPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/design" element={<Designer />}></Route>
            <Route path="/wishlist" element={<Wishlist />}></Route>
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
        //User Layout
        <Route path="/admin" element={<AdminDashboard />}></Route> //Admin
        Layout
      </Routes>
    </BrowserRouter>
  );
};

export default App;
