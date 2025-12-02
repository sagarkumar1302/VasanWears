import React from "react";
import { RiInstagramLine, RiTwitterXLine } from "@remixicon/react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const TopBar = () => {
    useGSAP(()=>{
        var t1= gsap.timeline()
        t1.from(".icons a",{
            opacity: 0,
            y: -30,
            duration: 0.8,
            stagger: 0.3
        })
        t1.from(".middleContent", {
            opacity: 0,
            y: -30,
            duration: 0.5,
        })
        t1.from(".contact", {
            opacity: 0,
            y: -30,
            duration: 0.8,
        })
    })
  return (
    <div className="bg-linear-to-br from-primary3 to-primary4 py-2  text-primary2 font-medium px-4">
      <div className="container mx-auto flex justify-between">
        <div className="icons md:flex items-center space-x-4 hidden">
          <Link to="#">
            <RiInstagramLine />
          </Link>
          <Link to="#">
            <RiTwitterXLine />
          </Link>
        </div>
        <div className="middleContent text-center grow">
          <span>🔥 Free shipping on all U.S. orders $50+</span>
        </div>
        <div className="contact md:block hidden">
          <Link to="tel:+91 9999999999">+91 9999999999</Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
