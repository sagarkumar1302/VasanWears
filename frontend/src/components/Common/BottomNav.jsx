import React from "react";
import {
  RiGridFill,
  RiUserLine,
  RiSearchLine,
  RiShoppingBag3Line,
  RiShoppingBagLine,
  RiUser3Line,
} from "@remixicon/react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/useAuthStore";
import default_female_avatar from "../../../public/images/female_default_avatar.png";
import default_male_avatar from "../../../public/images/male_default_avatar.png";
const BottomNav = () => {
  const totalQty = useCartStore((s) => s.totalQty);
  const user = useAuthStore((state) => state.user);
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2.5 px-4 flex justify-around items-center md:hidden z-50">
      {/* Shop */}
      <Link to="/shop/">
        <div className="flex flex-col items-center text-gray-600">
          <RiGridFill size={22} />
          <span className="text-xs mt-1">Shop</span>
        </div>
      </Link>

      {/* My Account */}
      <Link to="/my-account/">
        <div className="flex flex-col items-center text-gray-600">
          {user ? (
              <div>
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    className="h-8 w-8 rounded-full border-2 border-primary5"
                    alt={user?.fullName?.charAt(0)}
                  />
                ) : (
                  <div className="h-8 w-8 text-white flex justify-center items-center bg-primary4 rounded-full border-primary5/50 border">
                    <img
                      src={
                        user?.gender === "male"
                          ? default_male_avatar
                          : default_female_avatar
                      }
                      alt={user?.fullName}
                      className="h-8 w-8 rounded-full object-cover object-top border-2 border-primary5"
                    />
                  </div>
                )}
              </div>
            ) : (
              <RiUser3Line />
            )}
          <span className="text-xs mt-1">My account</span>
        </div>
      </Link>

      {/* Search */}

      {/* Cart */}
      <div className="relative flex flex-col items-center text-gray-600">
        <Link to="/cart/">
          <RiShoppingBagLine size={22} />
          <span className="text-xs mt-1">Cart</span>

          {/* Cart Badge */}
          <span className="absolute -top-1 -right-1 bg-primary5 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {totalQty}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
