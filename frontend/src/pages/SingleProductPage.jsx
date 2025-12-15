import {
  RiArrowDownSLine,
  RiArrowLeftLongLine,
  RiArrowRightLongLine,
  RiArrowUpSLine,
  RiHeartFill,
  RiHeartLine,
} from "@remixicon/react";
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import gsap from "gsap";
const dummyProduct = {
  id: 1,
  title: "All–Over–Print Hoodie",
  price: "$26.00 – $29.00",
  colors: ["#000000", "#ffffff", "#ffdd00", "#ff4444"],
  sizes: ["2XL", "XL", "L", "M", "S", "XS"],
  material: ["Cotton", "Polyester", "Blend"],
  media: [
    { type: "image", src: "/images/dummy/dummy1.png" },
    { type: "image", src: "/images/dummy/dummy2.png" },
    { type: "image", src: "/images/dummy/dummy2.png" },
    { type: "image", src: "/images/dummy/dummy2.png" },
    { type: "image", src: "/images/dummy/dummy3.png" },
    { type: "video", src: "/images/dummy/video1.mp4" },
  ],
  category: "Great Offers",
  subcategory: "Tank Top",
  description:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, illum, ipsam cum incidunt maiores itaque eligendi, hic velit atque natus ut omnis voluptas officiis cupiditate ipsa nemo? Quod, voluptas sed!",
};
const serviceablePincodes = {
  110001: "2–4 Days",
  400001: "3–5 Days",
  700001: "4–6 Days",
  560001: "2–3 Days",
};

const SingleProductPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [cartCount, setCartCount] = useState(1);
  const selectedMedia = dummyProduct.media[selectedIndex];
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [selectedColor, setSelectedColor] = useState(dummyProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState(dummyProduct.sizes[0]);
  const addToCart = useCartStore((state) => state.addToCart);
  const checkPincode = () => {
    if (serviceablePincodes[pincode]) {
      setDeliveryStatus({
        available: true,
        days: serviceablePincodes[pincode],
      });
    } else {
      setDeliveryStatus({
        available: false,
      });
    }
  };
  return (
    <div className="px-4 py-10 mt-30 md:mt-35">
      <div className="container mx-auto">
        <div className="md:pb-6 pb-4 md:flex gap-1 sm:gap-4 md:text-base text-sm whitespace-nowrap hidden">
          <span>
            <Link to="/">Home</Link>
          </span>
          <span>&gt;</span>
          <span> {dummyProduct.category}</span>
          <span>&gt;</span>
          <span>{dummyProduct.subcategory}</span>
          <span>&gt;</span>
          <span>{dummyProduct.title}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT SECTION */}
          <div className="flex gap-4 md:flex-row flex-col-reverse">
            {/* Thumbnails */}
            <div className="flex flex-row md:flex-col gap-3 overflow-auto md:overflow-visible  scrollbar-hide">
              {dummyProduct.media.map((m, i) => (
                <div
                  key={i}
                  className={`shrink-0 border rounded-lg cursor-pointer overflow-hidden 
                  ${
                    i === selectedIndex ? "border-primary5" : "border-primary1"
                  }`}
                  onClick={() => setSelectedIndex(i)}
                >
                  {m.type === "image" ? (
                    <img
                      src={m.src}
                      alt="thumb"
                      className="w-20 h-20 object-cover"
                    />
                  ) : (
                    <video
                      src={m.src}
                      className="w-20 h-20 object-cover"
                      muted
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Main Image / Video */}
            <div className="relative w-full h-[450px] md:h-fit xl:h-[800px] bg-primary3 rounded-xl overflow-hidden">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.src}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={selectedMedia.src}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )}

              {/* Slider Controls */}
              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === 0 ? dummyProduct.media.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white w-12 h-12 items-center justify-center rounded-full cursor-pointer hover:bg-primary1 flex"
              >
                <RiArrowLeftLongLine className="lg:h-6 lg:w-6 w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === dummyProduct.media.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white w-12 h-12 items-center justify-center rounded-full cursor-pointer hover:bg-primary1 flex"
              >
                <RiArrowRightLongLine className="lg:h-6 lg:w-6 w-5 h-5" />
              </button>
              <button className="absolute top-4 right-4 cursor-pointer">
                <RiHeartLine className="xl:h-8 xl:w-8 w-5 h-5 hover:text-primary1" />
                <RiHeartFill className="xl:h-8 xl:w-8 w-5 h-5 hover:text-primary1" />
                {/* Here to write the condition to check whether it is added on wishlisht or not */}
              </button>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-4xl font-semibold mb-2">
              {dummyProduct.title}
            </h2>
            <p className="text-base text-primary5 mb-4">
              {dummyProduct.description}
            </p>
            <p className="text-xl font-bold text-primary5 mb-4">
              {dummyProduct.price}
            </p>

            {/* Colors */}
            <div className="mb-4">
              <p className="font-medium mb-3">Color:</p>
              <div className="flex gap-4 ">
                {dummyProduct.colors.map((c, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: c }}
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full cursor-pointer border 
    ${
      selectedColor === c
        ? "border-primary5 border-2 scale-115"
        : "border-primary2"
    }
    transition-all duration-200`}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <p className="font-medium mb-3">Size:</p>
              <div className="flex flex-wrap gap-2">
                {dummyProduct.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(s)}
                    className={`
    px-4 py-1 border rounded transition cursor-pointer
    ${
      selectedSize === s
        ? "bg-primary5 text-white border-primary2"
        : "bg-white text-primary5 border-primary2 hover:bg-primary1 hover:text-white"
    }
  `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex gap-2 items-center bg-primary3 rounded-xl ">
                <button
                  className="w-15 py-0.5 h-full cursor-pointer text-2xl"
                  onClick={() => {
                    if (cartCount - 1 >= 0) {
                      setCartCount(cartCount - 1);
                    }
                  }}
                >
                  -
                </button>
                <span className=" font-bold"> {cartCount}</span>

                <button
                  className="w-15 py-0.5 h-full  cursor-pointer text-2xl"
                  onClick={() => {
                    setCartCount(cartCount + 1);
                  }}
                >
                  +
                </button>
              </div>
              {/* Add To Cart */}
              <button
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer"
                onClick={() =>
                  addToCart({
                    id: dummyProduct.id, // or product.id if dynamic
                    title: dummyProduct.title,
                    price: dummyProduct.price,
                    color: selectedColor,
                    size: selectedSize,
                    quantity: cartCount,
                    image: dummyProduct.media[0].src, // first image
                  })
                }
              >
                Add To Cart
              </button>
            </div>
            <Link
              to="/design"
              className="mt-4 py-2.5 px-8 rounded-xl font-semibold text-primary3 
             transition-all duration-300 btn-slide2 md:text-base text-sm  w-fit"
            >
              Design Your Tshirt
            </Link>
            {/* Share */}
            {/* Pincode Checker */}
            <div className="mt-6">
              <p className="font-medium mb-2">Check Delivery:</p>

              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // removes any non-numeric input
                    setPincode(val);
                  }}
                  placeholder="Enter Pincode"
                  className="border px-4 py-2 rounded-xl md:w-80 focus:outline-none w-40"
                />
                <button
                  onClick={checkPincode}
                  className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer"
                >
                  Check Pincode
                </button>
              </div>

              {deliveryStatus && (
                <div className="mt-3">
                  {deliveryStatus.available ? (
                    <p className="text-green-600 font-semibold">
                      ✓ Delivery available in {deliveryStatus.days}
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold">
                      ✗ Delivery not available for this pincode
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* <p className="font-medium mb-1">Share:</p>
            <div className="flex gap-3 text-xl">
              <i className="ri-facebook-line"></i>
              <i className="ri-instagram-line"></i>
              <i className="ri-twitter-line"></i>
            </div> */}
          </div>
        </div>

        {/* ---------------- TABS SECTION ---------------- */}
        <div className="mt-4 md:mt-16">
          {/* Tab Buttons */}
          <div className="hidden md:flex gap-6 border-b pb-2 text-gray-600 text-lg font-medium">
            {["description", "additional", "reviews", "more"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 cursor-pointer ${
                  activeTab === tab
                    ? " text-primary5 font-bold"
                    : "text-primary2"
                }`}
              >
                {tab === "description" && "Description"}
                {tab === "additional" && "Additional Information"}
                {tab === "reviews" && "Reviews (0)"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="hidden md:block mt-6 text-primary5 leading-relaxed">
            {activeTab === "description" && (
              <div>
                <p>
                  Built around a solid beech frame with legs in polished
                  stainless steel. The Wing chair employs a hand-stitched
                  natural upholstery that requires virtually no maintenance over
                  time.
                </p>
                <p className="mt-3">
                  Elegant design can be admired from all angles and fits well in
                  many interiors.
                </p>
              </div>
            )}

            {activeTab === "additional" && (
              <div>
                <p>
                  <strong>Material:</strong> Premium cotton (65%) + polyester
                  blend.
                </p>
                <p>
                  <strong>Weight:</strong> 450g
                </p>
                <p>
                  <strong>Colors:</strong> 6 color variations
                </p>
                <p>
                  <strong>Fit:</strong> Regular fit
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <p>No reviews yet.</p>
                <button className="mt-4 px-5 py-2 bg-black text-white rounded">
                  Write a Review
                </button>
              </div>
            )}
          </div>
          <div className="md:hidden mt-6 text-primary5 leading-relaxed">
            {/* Description */}
            <Accordion title="Description">
              <div>
                <p>
                  Built around a solid beech frame with legs in polished
                  stainless steel. The Wing chair employs a hand-stitched
                  natural upholstery that requires virtually no maintenance over
                  time.
                </p>
                <p className="mt-3">
                  Elegant design can be admired from all angles and fits well in
                  many interiors.
                </p>
              </div>
            </Accordion>

            {/* Additional Info */}
            <Accordion title="Additional Information">
              <div>
                <p>
                  <strong>Material:</strong> Premium cotton (65%) + polyester
                  blend.
                </p>
                <p>
                  <strong>Weight:</strong> 450g
                </p>
                <p>
                  <strong>Colors:</strong> 6 color variations
                </p>
                <p>
                  <strong>Fit:</strong> Regular fit
                </p>
              </div>
            </Accordion>

            {/* Reviews */}
            <Accordion title="Reviews">
              <div>
                <p>No reviews yet.</p>
                <button className="mt-4 px-5 py-2 bg-black text-white rounded">
                  Write a Review
                </button>
              </div>
            </Accordion>
          </div>
        </div>
        <div id="review">
        <p>No reviews yet.</p>
        <button className="mt-4 px-5 py-2 bg-black text-white rounded">
          Write a Review
        </button>
      </div>
      </div>
      
    </div>
  );
};
const Accordion = ({ title, children }) => {
  const [open, setOpen] = React.useState(false);
  const contentRef = useRef(null);

  const toggleAccordion = () => {
    const content = contentRef.current;

    if (!open) {
      // OPEN ANIMATION
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    } else {
      // CLOSE ANIMATION
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    }

    setOpen(!open);
  };

  return (
    <div className="border-b py-3 md:pb-3 md:py-0 border-b-primary1/50">
      <button
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center text-left font-semibold text-lg cursor-pointer"
      >
        {title}
        <span>{open ? <RiArrowUpSLine /> : <RiArrowDownSLine />}</span>
      </button>

      {/* ANIMATED CONTENT */}
      <div
        ref={contentRef}
        style={{ overflow: "hidden", height: 0 }}
        className="space-y-2"
      >
        <div className="pt-2 flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
};
export default SingleProductPage;
