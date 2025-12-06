import React from "react";
import Header from "../Common/Header";
import { Outlet } from "react-router-dom";
import Footer from "../Common/Footer";

const UserLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      {/* <div className='mt-2 h-screen bg-slate-100'></div> */}
      <Footer/>
    </>
  );
};

export default UserLayout;
