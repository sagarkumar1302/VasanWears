import React, { useState } from "react";
import TopBar from "../Layout/TopBar";
import Navbar from "./Navbar";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SearchBar from "./SearchBar";
const Header = () => {
  const [searchModel, setSearchModel] = useState(false);
  const [topBar, setTopBar] = useState(true);
  useGSAP(() => {
    // your existing animations...

    let lastScroll = 0;

    gsap.set(".navbar-wrapper", { y: 0 });

    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 0) {
        gsap.to(".navbar-wrapper", {
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        });
        setTopBar(false);
      } else if (currentScroll == 0) {
        // scrolling UP → show navbar
        gsap.to(".navbar-wrapper", {
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        });
        setTopBar(true);
      }

      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    });
  }, []);

  return (
    <header className="fixed top-0 w-full z-100 bg-white navbar-wrapper">
      <TopBar visible={topBar} />
      <Navbar setSearchModel={setSearchModel} searchModel={searchModel} />
      <SearchBar searchModel={searchModel} topBar={topBar} />
    </header>
  );
};

export default Header;
