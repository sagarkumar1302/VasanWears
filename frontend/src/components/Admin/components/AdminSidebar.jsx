import {
  HomeIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  StarIcon,
  PaintBrushIcon,
  UserGroupIcon,
  PhotoIcon,
  UserCircleIcon,
  TicketIcon,
  TruckIcon,
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
  const [orderOpen, setOrderOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  // Auto open Products submenu
  useEffect(() => {
    if (location.pathname.startsWith("/admin/products")) {
      setProductOpen(true);
    } else {
      setProductOpen(false);
    }

    if (location.pathname.startsWith("/admin/orders")) {
      setOrderOpen(true);
    } else {
      setOrderOpen(false);
    }

    if (location.pathname.startsWith("/admin/reviews")) {
      setReviewOpen(true);
    } else {
      setReviewOpen(false);
    }

    if (location.pathname.startsWith("/admin/designs")) {
      setDesignOpen(true);
    } else {
      setDesignOpen(false);
    }

    if (location.pathname.startsWith("/admin/users")) {
      setUserOpen(true);
    } else {
      setUserOpen(false);
    }

    if (location.pathname.startsWith("/admin/slider")) {
      setSliderOpen(true);
    } else {
      setSliderOpen(false);
    }

    if (location.pathname.startsWith("/admin/profile")) {
      setProfileOpen(true);
    } else {
      setProfileOpen(false);
    }

    if (location.pathname.startsWith("/admin/coupons")) {
      setCouponOpen(true);
    } else {
      setCouponOpen(false);
    }

    if (location.pathname.startsWith("/admin/delivery")) {
      setDeliveryOpen(true);
    } else {
      setDeliveryOpen(false);
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

      {/* ORDERS PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/orders")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/orders/all-orders");
            closeMobile?.();
          }}
        >
          <ShoppingCartIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Orders</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setOrderOpen(!orderOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              orderOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* ORDERS SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          orderOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/orders/all-orders"
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
          All Orders
        </NavLink>
        <NavLink
          to="/admin/orders/pending"
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
          Pending Orders
        </NavLink>
        <NavLink
          to="/admin/orders/processing"
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
          Processing
        </NavLink>
        <NavLink
          to="/admin/orders/shipped"
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
          Shipped
        </NavLink>
        <NavLink
          to="/admin/orders/delivered"
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
          Delivered
        </NavLink>
      </div>

      {/* REVIEWS PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/reviews")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/reviews/all-reviews");
            closeMobile?.();
          }}
        >
          <StarIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Reviews</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setReviewOpen(!reviewOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              reviewOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* REVIEWS SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          reviewOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/reviews/all-reviews"
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
          All Reviews
        </NavLink>
        <NavLink
          to="/admin/reviews/pending"
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
          Pending Approval
        </NavLink>
        <NavLink
          to="/admin/reviews/approved"
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
          Approved
        </NavLink>
      </div>

      {/* DESIGNS PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/designs")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/designs/all-designs");
            closeMobile?.();
          }}
        >
          <PaintBrushIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Designs</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setDesignOpen(!designOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              designOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* DESIGNS SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          designOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/designs/all-designs"
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
          All Designs
        </NavLink>
        <NavLink
          to="/admin/designs/pending"
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
          Pending Approval
        </NavLink>
        <NavLink
          to="/admin/designs/approved"
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
          Approved
        </NavLink>
      </div>

      {/* USERS PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/users")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/users/all-users");
            closeMobile?.();
          }}
        >
          <UserGroupIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Users</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setUserOpen(!userOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              userOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* USERS SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          userOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/users/all-users"
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
          All Users
        </NavLink>
        <NavLink
          to="/admin/users/add"
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
          Add User
        </NavLink>
        <NavLink
          to="/admin/users/subscribers"
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
          Subscribers
        </NavLink>
      </div>

      {/* SLIDER SETTING PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/slider")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/slider/all-sliders");
            closeMobile?.();
          }}
        >
          <PhotoIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Slider Setting</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setSliderOpen(!sliderOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              sliderOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* SLIDER SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          sliderOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/slider/all-sliders"
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
          All Sliders
        </NavLink>
        <NavLink
          to="/admin/slider/add"
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
          Add Slider
        </NavLink>
      </div>

      {/* ADMIN PROFILE PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/profile")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/profile/update");
            closeMobile?.();
          }}
        >
          <UserCircleIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Admin Profile</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(!profileOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* PROFILE SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          profileOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/profile/update"
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
          Update Profile
        </NavLink>
        <NavLink
          to="/admin/profile/password"
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
          Change Password
        </NavLink>
      </div>

      {/* COUPON PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/coupons")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/coupons/all-coupons");
            closeMobile?.();
          }}
        >
          <TicketIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Coupon</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setCouponOpen(!couponOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              couponOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* COUPON SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          couponOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/coupons/all-coupons"
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
          All Coupons
        </NavLink>
        <NavLink
          to="/admin/coupon/add"
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
          Add Coupon
        </NavLink>
        <NavLink
          to="/admin/coupon/active"
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
          Active Coupons
        </NavLink>
      </div>

      {/* DELIVERY CHARGES PARENT */}
      <div
        className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition ${
          location.pathname.startsWith("/admin/delivery")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-100"
        }`}
      >
        <div
          className="flex items-center flex-1"
          onClick={() => {
            navigate("/admin/delivery/settings");
            closeMobile?.();
          }}
        >
          <TruckIcon className="h-5 w-5 mr-3" />
          {isOpen && <span>Delivery Charges</span>}
        </div>
        {isOpen && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setDeliveryOpen(!deliveryOpen);
            }}
            className={`h-4 w-4 transition-transform ${
              deliveryOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* DELIVERY SUBMENU */}
      <div
        className={`ml-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          deliveryOpen && isOpen
            ? "max-h-80 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <NavLink
          to="/admin/delivery/settings"
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
          Delivery Settings
        </NavLink>
        <NavLink
          to="/admin/delivery/zones"
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
          Delivery Zones
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
