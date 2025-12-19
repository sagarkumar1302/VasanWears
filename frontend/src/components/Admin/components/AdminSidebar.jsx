import { HomeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";
import { adminLogout } from "../../../utils/adminApi";
import { useAdminAuthStore } from "../../../store/useAdminAuthStore";
const AdminSidebar = ({ isOpen, isMobileOpen, closeMobile }) => {
  const navigate = useNavigate();
  const adminLogoutAuth = useAdminAuthStore((state) => state.adminLogoutAuth);
  const adminLogoutHanlder = async () => {
    try {
      await adminLogout();
      adminLogoutAuth();
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error);
    }
  };
  const baseClasses =
    "fixed top-0 left-0 h-screen bg-white shadow-xl p-4 z-30 transition-all duration-300";

  return (
    <div
      className={`
        ${baseClasses}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${isOpen ? "w-72" : "w-20"}
      `}
    >
      {/* LOGO */}
      <div className="flex items-center p-2 mb-6 border-b">
        <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
        {isOpen && <h1 className="ml-3 font-bold">Dashboard</h1>}
      </div>

      {/* LINKS */}
      <NavLink
        to="/admin/dashboard"
        onClick={closeMobile}
        className={({ isActive }) =>
          `flex items-center p-3 rounded-lg ${
            isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-700"
          }`
        }
      >
        <HomeIcon className="h-5 w-5 mr-3" />
        {isOpen && "Dashboard"}
      </NavLink>

      <NavLink
        to="/admin/products"
        onClick={closeMobile}
        className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-indigo-100"
      >
        <ShoppingBagIcon className="h-5 w-5 mr-3" />
        {isOpen && "Products"}
      </NavLink>
      <button
        className="p-3 bg-red-500 cursor-pointer"
        onClick={adminLogoutHanlder}
      >
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
