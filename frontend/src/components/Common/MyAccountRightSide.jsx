import { RiUser3Line } from "@remixicon/react";
import React from "react";
const MyAccountRightSide = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-500">
      <div className="bg-primary3 p-6 rounded-full">
        <RiUser3Line className=" text-primary5 h-13 w-13" />
      </div>
      <h4 className="text-xl font-semibold text-primary2 mt-2">
        Welcome to Your Account
      </h4>
      <p className="mt-2 text-base text-primary5">
        Select an option from the left panel to view or manage your account
        details.
      </p>
    </div>
  );
};

export default MyAccountRightSide;
