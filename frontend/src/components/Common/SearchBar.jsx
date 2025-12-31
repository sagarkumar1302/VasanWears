import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { RiSearch2Line } from "@remixicon/react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ searchModel, topBar }) => {
  const [searchText, setSearchText] = useState("");
  const barRef = useRef(null);
  const t1 = useRef(null);
  const navigate = useNavigate();

  useGSAP(() => {
    t1.current = gsap.timeline({ paused: true });

    t1.current.from(barRef.current, {
      y: 80,
      opacity: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  }, []);

  useGSAP(() => {
    searchModel ? t1.current.play() : t1.current.reverse();
  }, [searchModel]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchText.trim())}`);
  };

  return (
    <div
      ref={barRef}
      className={`absolute left-0 ${
        topBar ? "top-[120px] md:top-[143px]" : "top-[83px] md:top-[103px]"
      } w-full bg-primary2 py-4 md:py-8 flex justify-center items-center px-4 md:px-10 xl:px-50 z-1`}
    >
      <input
        type="text"
        placeholder="What are you looking for..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="w-full pr-6 pl-12 text-lg outline-none border border-slate-100/35 mx-auto placeholder:text-white py-2 rounded-bl-xl rounded-tl-xl md:rounded-r-none text-white"
      />

      <RiSearch2Line
        className="text-white w-7 absolute left-6 md:left-12 xl:left-52 cursor-pointer"
        onClick={handleSearch}
      />
      <div className="bg-white px-4 py-2.5 rounded-r-xl md:hidden flex">
        <RiSearch2Line
          className="text-primary2 w-7  left-6 md:left-12 xl:left-52 cursor-pointer "
          onClick={handleSearch}
        />
      </div>
    </div>
  );
};

export default SearchBar;
