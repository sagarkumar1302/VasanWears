import {
  HomeIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  PlusCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminLogout } from "../../../utils/adminApi";
import { useAdminAuthStore } from "../../../store/useAdminAuthStore";

const AdminSidebar = ({ isOpen, isMobileOpen, closeMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminLogoutAuth = useAdminAuthStore((state) => state.adminLogoutAuth);

  const [productOpen, setProductOpen] = useState(false);

  // Auto open Products submenu
  useEffect(() => {
    if (location.pathname.startsWith("/admin/products")) {
      setProductOpen(true);
    } else {
      setProductOpen(false);
    }
  }, [location.pathname]);

  const adminLogoutHandler = async () => {
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
    <aside
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
        {isOpen && <h1 className="ml-3 font-bold">Admin Panel</h1>}
      </div>

      {/* DASHBOARD */}
      <NavLink
        to="/admin/dashboard"
        end
        onClick={closeMobile}
        className={({ isActive }) =>
          `flex items-center p-3 rounded-lg mb-1 transition ${
            isActive
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-700 hover:bg-indigo-100"
          }`
        }
      >
        <HomeIcon className="h-5 w-5 mr-3" />
        {isOpen && "Dashboard"}
      </NavLink>

      {/* PRODUCTS PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/products")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        {/* Navigate to all products */}
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/products/all-products");
            closeMobile?.();
          }}
        >
          <ShoppingBagIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Products</span>}
        </div>

        {/* Toggle submenu */}
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setProductOpen(!productOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              productOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* PRODUCTS SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          productOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        {/* ALL PRODUCTS */}
        <NavLink
          to="/admin/products/all-products"
          end
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center p-2 mt-1 rounded text-sm transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <Squares2X2Icon className="h-4 w-4 mr-2" />
          All Products
        </NavLink>

        {/* ADD PRODUCT */}
        <NavLink
          to="/admin/products/add"
          end
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center p-2 rounded text-sm transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Add Product
        </NavLink>
        <NavLink
          to="/admin/products/category"
          end
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center p-2 rounded text-sm transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Category
        </NavLink>
        <NavLink
          to="/admin/products/color"
          end
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center p-2 rounded text-sm transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Color
        </NavLink>
        <NavLink
          to="/admin/products/sizes"
          end
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center p-2 rounded text-sm transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Sizes
        </NavLink>
      </div>

      {/* LOGOUT */}
      <button
        onClick={adminLogoutHandler}
        className="absolute bottom-6 left-4 right-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
