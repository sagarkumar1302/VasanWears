import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/VasanWears.png";
import {
  RiCloseLine,
  RiHeartLine,
  RiMenu2Line,
  RiProfileLine,
  RiSearch2Line,
  RiShoppingBagLine,
  RiUser3Line,
  RiUserLine,
} from "@remixicon/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CartDrawer from "../Layout/CartDrawer";
const Navbar = ({ searchModel, setSearchModel }) => {
  const [cartDrawer, setCartDrawer] = useState(false);
  const mobileMenuTimeline = useRef(null);
  useGSAP(() => {
    var t1 = gsap.timeline();

    t1.from(".mobile-1", {
      opacity: 0,
      x: -30,
      duration: 0.4,
    });
    t1.from(".logo", {
      opacity: 0,
      x: -30,
      duration: 0.4,
    });
    t1.from(".menu a", {
      opacity: 0,
      y: -30,
      duration: 0.3,
      stagger: 0.15,
    });
    t1.from(".menu-icons>a,.menu-icons button", {
      opacity: 0,
      x: 30,
      duration: 0.2,
      stagger: 0.15,
    });
    mobileMenuTimeline.current = gsap.timeline({ paused: true });
    mobileMenuTimeline.current.to(".mobile-menu", {
      x: 0,
      duration: 0.2,
      ease: "power3.out",
    });
    mobileMenuTimeline.current.from(".mobile-menu a", {
      x: -20,
      opacity: 0,
      duration: 0.2,
      stagger: 0.1,
    });
    mobileMenuTimeline.current.from(".mobile-cross", {
      x: 20,
      opacity: 0,
      duration: 0.2,
    });
  }, []);
  const mobileSidebarOpen = () => {
    document.body.style.overflow = "hidden";
    mobileMenuTimeline.current.play();
  };
  const mobileSidebarClose = () => {
    document.body.style.overflow = "auto";
    mobileMenuTimeline.current.reverse();
  };
  return (
    <div className={"px-4 border-b border-b-slate-200 z-20 "}>
      <nav className="container mx-auto flex items-center justify-between  py-4">
        <div className="md:hidden flex mobile-1">
          <button onClick={mobileSidebarOpen}>
            <RiMenu2Line />
          </button>
        </div>
        <div className="logo flex md:ml-0 ml-8">
          <Link to="/">
            <img
              src={logo}
              alt="Logo of Vasan Wears"
              className="w-20 md:w-28"
            />
          </Link>
        </div>
        <div className="hidden md:flex space-x-6 text-primary2  uppercase font-medium text-sm items-center menu">
          <Link to="/" className="hover:text-primary1 menu-item">
            Home
          </Link>
          <Link to="/shop" className="hover:text-primary1 menu-item">
            Shop
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
        <div className=" items-center space-x-4 menu-icons flex ">
          <button
            className="hover:text-primary1 cursor-pointer"
            onClick={() => {
              setSearchModel(!searchModel);
            }}
          >
            <RiSearch2Line />
          </button>
          <Link to="" className="hover:text-primary1 md:block hidden">
            <RiHeartLine />
          </Link>
          <button
            className="cursor-pointer relative"
            onClick={() => {
              setCartDrawer(!cartDrawer);
            }}
          >
            <RiShoppingBagLine className="hover:text-primary1" />
            <span className="absolute px-2 py-0.5 bg-primary5 -top-4 left-3 text-xs flex items-center justify-center rounded-full text-primary3">
              20
            </span>
          </button>
          <Link to="" className="hover:text-primary1 md:block hidden">
            <RiUser3Line />
          </Link>
        </div>
      </nav>
      <div className="z-50 w-full h-screen fixed bg-linear-to-bl  from-primary1 to-primary4 backdrop-blur-2xl left-0 top-0 mobile-menu -translate-x-full flex flex-col p-6 text-3xl justify-center items-center gap-4 font-semibold overflow-hidden">
        <Link
          to="/"
          className="hover:text-primary2 "
          onClick={mobileSidebarClose}
        >
          Home
        </Link>
        <Link
          to="/shop"
          className="hover:text-primary2 "
          onClick={mobileSidebarClose}
        >
          Shop
        </Link>
        <Link
          to="/"
          className="hover:text-primary2 "
          onClick={mobileSidebarClose}
        >
          Men
        </Link>
        <Link
          to="/"
          className="hover:text-primary2 "
          onClick={mobileSidebarClose}
        >
          Women
        </Link>
        <Link
          to="/"
          className="hover:text-primary2 "
          onClick={mobileSidebarClose}
        >
          Contact Us
        </Link>
        <button
          className="bg-primary3 p-2 rounded-full absolute top-10 right-10 mobile-cross"
          onClick={mobileSidebarClose}
        >
          <RiCloseLine className="w-10 h-10" />
        </button>
      </div>
      <CartDrawer setCartDrawer={setCartDrawer} cartDrawer={cartDrawer} />
    </div>
  );
};

export default Navbar;
