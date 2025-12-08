import React, { useState, useRef } from "react";
import { PRODUCTS } from "../components/Common/ProductShowcase"; // your data file
import gsap from "gsap";
import {
  RiHeartLine,
  RiSearch2Line,
  RiShoppingBagLine,
  RiStarSmileLine,
} from "@remixicon/react";
import Banner from "../components/Common/Banner";
const ShopPage = () => {
  const [sortType, setSortType] = useState("default");

  // SORTING FUNCTION
  const sortProducts = (products) => {
    let sorted = [...products];

    if (sortType === "low-to-high") {
      sorted.sort(
        (a, b) =>
          parseFloat(a.price.replace("₹", "")) -
          parseFloat(b.price.replace("₹", ""))
      );
    } else if (sortType === "high-to-low") {
      sorted.sort(
        (a, b) =>
          parseFloat(b.price.replace("₹", "")) -
          parseFloat(a.price.replace("₹", ""))
      );
    }

    return sorted;
  };

  const finalProducts = sortProducts(PRODUCTS);

  return (
    <div className="py-10  ">
      {/* Page Wrapper */}
        <Banner />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ---------------------- LEFT FILTER BAR ---------------------- */}
          <aside className="space-y-6 border-r pr-5 hidden lg:block">
            {/* Search */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Search</h3>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Search products..."
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Product categories</h3>
              <ul className="space-y-2">
                {[
                  "Hoodie",
                  "Kids",
                  "Long Sleeves",
                  "Product Designer",
                  "Sweater",
                ].map((cat, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-gray-600 cursor-pointer"
                  >
                    <span>{cat}</span>
                    <span>{Math.floor(Math.random() * 15)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Filter by Size</h3>
              <ul className="space-y-2">
                {["2XL", "3XL", "L", "M", "S"].map((size, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-gray-600 cursor-pointer"
                  >
                    <span>{size}</span>
                    <span>{Math.floor(Math.random() * 15)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Material */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Filter by Material</h3>
              <ul className="space-y-4">
                {["Glass", "Metal", "Paper", "Wood"].map((mat, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200"></div>
                      <span className="text-gray-600">{mat}</span>
                    </div>
                    <span>{Math.floor(Math.random() * 15)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price filter */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Price filter</h3>
              <ul className="space-y-2 text-gray-600">
                <li>All</li>
                <li>₹0 – ₹40</li>
                <li>₹40 – ₹80</li>
                <li>₹80 – ₹120</li>
                <li>₹120 – ₹160</li>
              </ul>
            </div>
          </aside>

          {/* ---------------------- PRODUCT LIST + SORT ---------------------- */}
          <div className="lg:col-span-4">
            {/* Sorting Bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Shop</h2>

              <select
                className="border px-4 py-2 rounded-md"
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="default">Sort by</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {finalProducts.map((product) => (
                <ProductCard data={product} key={product.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const ProductCard = ({ data }) => {
  const imgRef = useRef(null);
  const hoverImgRef = useRef(null);
  const sideIconRef = useRef(null);

  // Individual refs for each card (very important!)
  const handleHoverIn = () => {
    gsap.to(sideIconRef.current, {
      opacity: 1,
      duration: 0.2,
      ease: "power2.out",
    });
    gsap.to(hoverImgRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.to(sideIconRef.current.querySelectorAll("div"), {
      opacity: 1,
      x: -10,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out",
    });
  };

  const handleHoverOut = () => {
    gsap.to(hoverImgRef.current, {
      opacity: 0,
      duration: 0.4,
    });
    gsap.to(sideIconRef.current.querySelectorAll("div"), {
      opacity: 0,
      x: 0,
      duration: 0.4,
      stagger: 0.1,
    });
    gsap.to(sideIconRef.current, {
      opacity: 0,
      duration: 0.2,
    });
  };

  return (
    <div
      // className="relative group cursor-pointer hover:scale-105 duration-300 hover:shadow-xl p-4 rounded-xl hover:-translate-y-3 transform-gpu"
      className="relative group cursor-pointer duration-300 hover:shadow-xl p-4 rounded-xl hover:-translate-y-3 transform-gpu"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      {/* Tags */}
      <div className="absolute top-7 left-7 flex flex-col gap-1 z-10">
        {data.tags.map((t, i) => (
          <span
            key={i}
            className="bg-primary5 text-white px-2 py-0.5 rounded text-xs font-semibold w-fit"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Image Wrapper */}
      <div className="relative rounded-xl overflow-hidden">
        <img
          ref={imgRef}
          src={data.image}
          className="w-full h-[350px] object-cover"
        />

        <img
          ref={hoverImgRef}
          src={data.hoverImage}
          className="w-full h-[350px] object-cover absolute inset-0 opacity-0"
        />

        {/* Icons */}
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0"
          ref={sideIconRef}
        >
          {[RiStarSmileLine, RiHeartLine, RiShoppingBagLine, RiSearch2Line].map(
            (Icon, i) => (
              <div
                key={i}
                className={`cursor-pointer translate-y-2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-primary1 hover:text-white transition-all}`}
              >
                <Icon size={18} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Product Details */}
      <h3 className="mt-4 text-xl md:text-2xl font-semibold">{data.title}</h3>
      <p className="text-gray-700 mt-1">
        <span className="font-bold text-primary5 text-lg">{data.price}</span>{" "}
        {data.oldPrice && (
          <del className="ml-2 text-gray-400">{data.oldPrice}</del>
        )}
      </p>
    </div>
  );
};
export default ShopPage;
