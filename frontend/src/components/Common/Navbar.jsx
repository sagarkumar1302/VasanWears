import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/VasanWears.png";
import {
  RiHeartLine,
  RiProfileLine,
  RiSearch2Line,
  RiShoppingBagLine,
  RiUser3Line,
  RiUserLine,
} from "@remixicon/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const Navbar = () => {
  useGSAP(() => {
    var t1 = gsap.timeline();
    t1.from(".logo", {
      opacity: 0,
      x: -30,
      duration: 1,
    });
    t1.from(".menu a", {
      opacity: 0,
      y: -30,
      duration: 0.4,
      stagger: 0.3
    });
    t1.from(".menu-icons>a,.menu-icons button", {
      opacity: 0,
      x: 30,
      duration: 0.4,
      stagger: 0.3
    });
    
  });
  return (
    <div className="px-4 border-b border-b-slate-200">
      <nav className="container mx-auto flex items-center justify-between  py-4">
        <div className="w-28 logo">
          <Link to="/">
            <img src={logo} alt="Logo of Vasan Wears" />
          </Link>
        </div>
        <div className="hidden md:flex space-x-6 text-primary2  uppercase font-medium text-sm items-center menu">
          <Link to="/" className="hover:text-primary1 menu-item">
            Home
          </Link>
          <Link to="/" className="hover:text-primary1 menu-item">
            About
          </Link>
          <Link to="/" className="hover:text-primary1 menu-item">
            Men
          </Link>
          <Link to="/" className="hover:text-primary1 menu-item">
            Women
          </Link>
          <Link to="/" className="hover:text-primary1 menu-item">
            Contact Us
          </Link>
        </div>
        <div className="flex items-center space-x-4 menu-icons">
          <Link to="" className="hover:text-primary1">
            <RiSearch2Line />
          </Link>
          <Link to="" className="hover:text-primary1">
            <RiHeartLine />
          </Link>
          <button className="cursor-pointer relative">
            <RiShoppingBagLine className="hover:text-primary1" />
            <span className="absolute px-2 py-0.5 bg-primary1 -top-4 left-3 text-xs flex items-center justify-center rounded-full text-primary2">
              20
            </span>
          </button>
          <Link to="" className="hover:text-primary1">
            <RiUser3Line />
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
