import React from "react";
import TopBar from "../Layout/TopBar";
import Navbar from "./Navbar";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const Header = ({t1}) => {
  return (
    <header>
      <TopBar t1={t1}/>
      <Navbar t1={t1}/>
    </header>
  );
};

export default Header;
