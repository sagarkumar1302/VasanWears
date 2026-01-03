import React, { useRef } from "react";
import { RiFacebookCircleFill, RiInstagramFill, RiInstagramLine, RiTwitterXLine, RiYoutubeFill } from "@remixicon/react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const TopBar = ({ visible }) => {
  useGSAP(() => {
    var t1 = gsap.timeline();
    t1.from(".icons a", {
      opacity: 0,
      y: -30,
      duration: 0.8,
      stagger: 0.3,
    });
    t1.from(".middleContent", {
      opacity: 0,
      y: -30,
      duration: 0.5,
    });
    t1.from(".contact", {
      opacity: 0,
      y: -30,
      duration: 0.8,
    });
  }, []);
  return (
    <div
      className={`bg-linear-to-br from-primary3 to-primary4 py-2  text-primary2 font-medium px-4 ${
        visible ? "" : "hidden"
      }`}
    >
      <div className="container mx-auto flex justify-between">
        <div className="icons md:flex items-center space-x-4 hidden">
          <a
            href="https://youtube.com/@vasanwears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary1"
          >
            <RiYoutubeFill size={22} />
          </a>
          <a
            href="https://x.com/VasanWears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary1"
          >
            <RiTwitterXLine size={22} />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61585672538949"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary1"
          >
            <RiFacebookCircleFill size={22} />
          </a>
          <a
            href="https://www.instagram.com/vasan_wears/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary1"
          >
            <RiInstagramFill size={22} />
          </a>
        </div>
        <div className="middleContent text-center grow">
          <span>🔥 Design it. Wear it. Earn from it.</span>
        </div>
        <div className="contact md:block hidden">
          <a href="mailto:info@vasanwears.in" className=" font-semibold">info@vasanwears.in</a>
        </div>
        {/* <div className="contact md:block hidden">
          <Link to="tel:+91 9999999999">+91 9999999999</Link>
        </div> */}
      </div>
    </div>
  );
};

export default TopBar;
