import React, { useState, useRef } from "react";
import {
  RiStarSmileLine,
  RiHeartLine,
  RiShoppingBagLine,
  RiSearch2Line,
} from "@remixicon/react";
import gsap from "gsap";
import { PRODUCTS } from "../../utils/Products";
const TABS = ["Best Selling", "New Arrival", "Great Offers", "sagarr", "New"];




const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState("Best Selling");
  const filteredProducts = PRODUCTS.filter(
    (item) => item.category === activeTab
  );
  return (
    <div className="px-5 w-full pb-5 pt-8 md:py-20 bg-white">
      {/* Heading */}
      <div className="container mx-auto">
        <div className="text-center mb-5 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Lorem Ipsum Dolor
          </h2>
          <p className="text-primary5 md:max-w-2xl w-full mx-auto mt-3">
            Lorem ipsum det, cowec tetuec tetur duis necgi duis necgi det,
            consec eturlagix adipiscinig eliet.
          </p>

          {/* Tabs */}
          <div className="flex md:justify-center mt-6 gap-4 overflow-x-auto w-full md:py-0 py-2 md:px-0 px-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  console.log(activeTab);
                }}
                className={`px-5 md:px-6 py-2.5 rounded-full text-sm md:text-[15px] font-bold transition-all cursor-pointer whitespace-nowrap
                ${
                  activeTab === tab
                    ? "bg-primary1 text-primary2"
                    : "bg-primary3/60 hover:bg-primary3"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:gap-4 gap-5 ">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------- PRODUCT CARD -----------------

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
      className="relative group cursor-pointer duration-300 hover:shadow-xl p-4 rounded-xl hover:-translate-y-3"
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
          className="w-full object-cover"
        />

        <img
          ref={hoverImgRef}
          src={data.hoverImage}
          className="w-full object-cover absolute inset-0 opacity-0"
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
      <h3 className="mt-4 text-base md:text-xl font-bold product-title">{data.title}</h3>
      <p className="text-gray-700 mt-1">
        <span className="font-bold text-primary5 text-lg">{data.price}</span>{" "}
        {data.oldPrice && (
          <del className="ml-2 text-gray-400">{data.oldPrice}</del>
        )}
      </p>
    </div>
  );
};

export default ProductShowcase;
