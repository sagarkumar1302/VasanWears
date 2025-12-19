import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { logoutUser } from "../utils/userApi";
import { Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import default_female_avatar from "../../public/images/female_default_avatar.png";
import default_male_avatar from "../../public/images/male_default_avatar.png";
// import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import gsap from "gsap";
import Accordion from "../components/Common/Accordion"; // <-- using your Accordion component
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

const MyAccount = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  console.log("Pathname: ", pathname);
  
  const logoutHandler = async () => {
    try {
      navigate("/", { replace: true });
      await logoutUser();
      logout();
      
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error);
    }
  };

  const sidebarItems = [
    {
      label: "ACCOUNT SETTINGS",
      children: [
        { label: "Profile Information", tab: "profile-information" },
        { label: "Manage Addresses", tab: "addresses" },
        { label: "PAN Card Information", tab: "pan" },
      ],
    },
    {
      label: "ORDERS DETAILS",
      children: [
        { label: "Orders", tab: "orders" },
        { label: "Saved UPI", tab: "upi" },
        { label: "Saved Cards", tab: "cards" },
      ],
    },
    {
      label: "MY STUFF",
      children: [
        { label: "My Coupons", tab: "coupons" },
        { label: "My Reviews & Ratings", tab: "reviews" },
        { label: "All Notifications", tab: "notifications" },
        { label: "My Wishlist", tab: "wishlist" },
      ],
    },
  ];

  return (
    <div className="px-4 md:mt-35 mt-30 md:py-10 py-5">
      <div className="container mx-auto flex flex-col md:flex-row gap-6">
        {/* ------------------------------------
             SIDEBAR WITH ACCORDION + AVATAR
        ------------------------------------- */}
        <div className={`bg-white w-full md:w-72 p-4 shadow rounded-lg h-fit ${!pathname.endsWith("account")? 'md:block hidden': ''}`}>
          <div className="flex flex-col items-center mb-6">
            {user?.avatar ? (
              <img
                src={user?.avatar}
                alt={user?.fullName}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary5"
              />
            ) : (
              <div className="h-20 w-20 text-white flex justify-center items-center bg-primary4 rounded-full border-primary5/50 border text-5xl">
                {/* {user?.fullName?.charAt(0)} */}
                <img
                  src={
                    user?.gender === "male"
                      ? default_male_avatar
                      : default_female_avatar
                  }
                  alt={user?.fullName}
                  className="w-20 h-20 rounded-full object-cover object-top border-2 border-primary5"
                />
              </div>
            )}
            <h3 className="text-primary5 text-xl font-semibold mt-2 text-center">
              Hello, {user?.fullName}
            </h3>
          </div>

          {/* Accordion Menu */}
          <div className="space-y-1">
            {sidebarItems.map((item, index) => (
              <Accordion key={index} title={item.label}>
                {item.children.map((child, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/my-account/${child.tab}`)}
                    className={`text-left w-full px-3 py-2 rounded-md cursor-pointer text-sm
     transition 
    ${
      location.pathname.includes(child.tab)
        ? "bg-primary1/80 text-primary2 font-medium hover:bg-primary1"
        : "text-primary2 hover:bg-primary3"
    }
  `}
                  >
                    {child.label}
                  </button>
                ))}
              </Accordion>
            ))}
          </div>

          <button
            onClick={logoutHandler}
            className="cursor-pointer mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* ------------------------------------
             MAIN CONTENT AREA
        ------------------------------------- */}
        <div className={`w-full bg-white p-6 shadow rounded-lg h-fit ${pathname.endsWith("account")? 'md:block hidden': ''}`}>
          <button
          onClick={() => navigate(-1)}
          className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm mb-8 md:hidden flex gap-4"
        >
          <RiArrowLeftLine/>
          
        </button>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
