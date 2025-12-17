import React, { useRef } from "react";
import {
  RiDeleteBinLine,
  RiHeartLine,
  RiSearch2Line,
  RiShoppingBagLine,
  RiShoppingCartLine,
  RiStarSmileLine,
} from "@remixicon/react";
import Banner from "../components/Common/Banner";
import { PRODUCTS } from "../utils/Products";
import gsap from "gsap";
import slugify from "../utils/Slug";
import { Link } from "react-router-dom";
const Wishlist = () => {
  return (
    <div className="md:py-10 pt-10">
      <Banner pageTitle="Wishlist" />
      <div className="container mx-auto px-4 py-10">
        <h2 className="md:text-3xl  text-2xl font-semibold mb-8 text-center">
          My Wishlist ({PRODUCTS?.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:gap-4 gap-5 ">
          {PRODUCTS?.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
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
      className="relative group cursor-pointer duration-300 hover:shadow-xl p-4 rounded-xl hover:-translate-y-3"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      {/* Tags */}
      <Link to={`/shop/${data.id}/${slugify(data.title)}`}>
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
          <img ref={imgRef} src={data.image} className="w-full object-cover" />

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
            {[
              RiStarSmileLine,
              RiHeartLine,
              RiShoppingBagLine,
              RiSearch2Line,
            ].map((Icon, i) => (
              <div
                key={i}
                className={`cursor-pointer translate-y-2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-primary1 hover:text-white transition-all}`}
              >
                <Icon size={18} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <h3 className="mt-4 text-base md:text-xl font-bold product-title">
          {data.title}
        </h3>
        <p className="text-gray-700 mt-1">
          <span className="font-bold text-primary5 text-lg">{data.price}</span>{" "}
          {data.oldPrice && (
            <del className="ml-2 text-gray-400">{data.oldPrice}</del>
          )}
        </p>
      </Link>
    </div>
  );
};
export default Wishlist;
