import React, { useState, useRef, useMemo, useEffect } from "react";
import { PRODUCTS } from "../utils/Products";
import gsap from "gsap";
// ... (imports remain the same)
import Banner from "../components/Common/Banner";
import CustomSortDropdown from "../components/Common/CustomSortDropdown";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiHeartLine,
  RiSearch2Line,
  RiShoppingBagLine,
  RiSortAlphabetAsc,
  RiStarSmileLine,
} from "@remixicon/react";
import { Link } from "react-router-dom";

const ShopPage = () => {
  // --- MAIN FILTER STATE (Applied to finalProducts) ---
  const [sortType, setSortType] = useState("default");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2400]); // min to max price in ₹

  // --- TEMPORARY MOBILE FILTER STATE ---
  // These only update the main state when 'Apply' is clicked
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempSubCategory, setTempSubCategory] = useState(selectedSubCategory);
  const [tempColor, setTempColor] = useState(selectedColor);
  const [tempSize, setTempSize] = useState(selectedSize);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  // Effect to initialize temporary state when the component mounts or main state changes
  // This is crucial for *desktop* filters to update the mobile state when the panel opens.
  useEffect(() => {
    setTempCategory(selectedCategory);
    setTempSubCategory(selectedSubCategory);
    setTempColor(selectedColor);
    setTempSize(selectedSize);
    setTempPriceRange(priceRange);
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedColor,
    selectedSize,
    priceRange,
  ]);

  // --- HANDLERS ---

  const handleApplyFilters = () => {
    // 1. Update main state with temporary state
    setSelectedCategory(tempCategory);
    setSelectedSubCategory(tempSubCategory);
    setSelectedColor(tempColor);
    setSelectedSize(tempSize);
    setPriceRange(tempPriceRange);

    // 2. Close the mobile filter panel
    sortingFilterMobileClose();
  };

  const handleClearFilters = () => {
    // 1. Reset both temporary and main states
    setTempCategory("");
    setTempSubCategory("");
    setTempColor("");
    setTempSize("");
    setTempPriceRange([0, 2400]);

    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedColor("");
    setSelectedSize("");
    setPriceRange([0, 2400]);

    // 2. Close the mobile filter panel
    sortingFilterMobileClose();
  };

  // --- (Rest of the component logic remains the same) ---
  const pageTitle = "Shop";

  // Extract unique filters
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];
  const subcategories = [...new Set(PRODUCTS.map((p) => p.subcategory))];
  const colors = [
    ...new Map(
      PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])
    ).values(),
  ];
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchInput);
    }, 800);

    return () => clearTimeout(delay); // cleanup on next type
  }, [searchInput]);
  const sizes = [...new Set(PRODUCTS.flatMap((p) => p.sizes))];

  // Convert ₹ price to number
  const numericPrice = (str) => parseFloat(str.replace("₹", ""));

  // Filtering + Sorting (Uses the MAIN state variables)
  const finalProducts = useMemo(() => {
    let data = [...PRODUCTS];

    // Search Filter
    if (search.trim() !== "") {
      data = data.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category Filter
    if (selectedCategory) {
      data = data.filter((item) => item.category === selectedCategory);
    }

    // Subcategory Filter
    if (selectedSubCategory) {
      data = data.filter((item) => item.subcategory === selectedSubCategory);
    }

    // Color Filter
    if (selectedColor) {
      // Note: This filter logic seems slightly incorrect based on common data structures,
      // but we'll leave it as is to match your original code's intent.
      // Assuming item.colors is an array of color names or objects containing 'name'.
      data = data.filter(
        (item) => item.colors.some((c) => c.name === selectedColor) // Corrected to use object structure if p.colors contains objects
      );
      // If item.colors is just an array of strings (names):
      // data = data.filter((item) => item.colors.includes(selectedColor));
    }

    // Size Filter
    if (selectedSize) {
      data = data.filter((item) => item.sizes.includes(selectedSize));
    }

    // Price Filter
    data = data.filter(
      (item) =>
        numericPrice(item.price) >= priceRange[0] &&
        numericPrice(item.price) <= priceRange[1]
    );

    // Sorting
    if (sortType === "low-to-high") {
      data.sort((a, b) => numericPrice(a.price) - numericPrice(b.price));
    } else if (sortType === "high-to-low") {
      data.sort((a, b) => numericPrice(b.price) - numericPrice(a.price));
    }

    return data;
  }, [
    sortType,
    search,
    selectedCategory,
    selectedSubCategory,
    selectedColor,
    selectedSize,
    priceRange,
  ]);

  const sortingFilterMobile = () => {
    // IMPORTANT: When opening, reset the temporary state to the current applied state
    setTempCategory(selectedCategory);
    setTempSubCategory(selectedSubCategory);
    setTempColor(selectedColor);
    setTempSize(selectedSize);
    setTempPriceRange(priceRange);

    const filterEl = document.querySelector(".mobile-filter");
    gsap.fromTo(
      filterEl,
      { y: "100%" }, // starting position
      { y: "0%", duration: 0.5, ease: "power3.out" }
    );
  };

  const sortingFilterMobileClose = () => {
    const filterEl = document.querySelector(".mobile-filter");
    gsap.fromTo(
      filterEl,
      { y: "0" }, // starting position
      { y: "100%", duration: 0.5, ease: "power3.out" }
    );
  };

  return (
    <div className="md:py-10 pt-10">
      <Banner pageTitle={pageTitle} />

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ----------------- LEFT SIDEBAR FILTER (DESKTOP) ----------------- */}
          <aside className="space-y-6 border-r pr-5 hidden lg:block border-primary5/20">
            {/* Search, Category, Subcategory, Color, Size, Price Filter components 
                            ... All desktop filters correctly use the main state setters 
                            (setSelectedCategory, setPriceRange, etc.)
                        */}
            <Accordion title="Search">
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 border-primary5"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </Accordion>
            {/* Category Filter - DESKTOP */}
            <Accordion title="Category">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat}
                    onChange={() =>
                      setSelectedCategory(selectedCategory === cat ? "" : cat)
                    }
                    className="w-4 h-4"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </Accordion>
            {/* Subcategory Filter - DESKTOP */}
            <Accordion title="Subcategory">
              {subcategories.map((sub) => (
                <label
                  key={sub}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubCategory === sub}
                    onChange={() =>
                      setSelectedSubCategory(
                        selectedSubCategory === sub ? "" : sub
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span>{sub}</span>
                </label>
              ))}
            </Accordion>
            {/* Color Filter - DESKTOP */}
            <Accordion title="Color">
              {colors.map((color) => (
                <label
                  key={color.name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColor === color.name}
                    onChange={() =>
                      setSelectedColor(
                        selectedColor === color.name ? "" : color.name
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span>{color.name}</span>
                  <div
                    className="w-4 h-4 rounded-sm border"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                </label>
              ))}
            </Accordion>

            {/* Sizes Filter - DESKTOP */}
            <Accordion title="Size">
              {sizes.map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSize === size}
                    onChange={() =>
                      setSelectedSize(selectedSize === size ? "" : size)
                    }
                    className="w-4 h-4"
                  />
                  <span className="">{size}</span>
                </label>
              ))}
            </Accordion>

            {/* Price Filter - DESKTOP */}
            <Accordion title="Price Range">
              <CustomPriceSlider
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </Accordion>
          </aside>

          {/* ----------------- PRODUCT LIST ----------------- */}
          <div className="lg:col-span-4">
            {/* Sorting Bar */}
            <div className="md:flex hidden justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Shop</h2>
              <CustomSortDropdown setSortType={setSortType} />
            </div>
            <div className="md:hidden flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-bold">Shop</h2>
              <button className="cursor-pointer" onClick={sortingFilterMobile}>
                <RiSortAlphabetAsc />
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
              {finalProducts.length === 0 ? (
                <p>No products found.</p>
              ) : (
                finalProducts.map((product) => (
                  <ProductCard data={product} key={product.id} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- MOBILE FILTER PANEL ----------------- */}
      <div className="md:hidden flex fixed inset-0 translate-y-full mobile-filter h-screen w-full z-50">
        <div
          className="absolute inset-0 bg-black/20"
          onClick={sortingFilterMobileClose}
        ></div>
        <div className="h-[64vh] overflow-y-auto w-full bg-white absolute bottom-0 px-5 pb-20 rounded-t-xl pt-4">
          <h3 className="text-xl font-bold py-3 border-b mb-3">
            Filter Options
          </h3>

          {/* Search (Note: Search still applies immediately due to design, but you can convert it to temp state too if desired) */}
          <Accordion title="Search">
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 border-primary5"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </Accordion>

          {/* Category Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Category">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tempCategory === cat}
                  onChange={() =>
                    setTempCategory(tempCategory === cat ? "" : cat)
                  }
                  className="w-4 h-4"
                />
                <span>{cat}</span>
              </label>
            ))}
          </Accordion>

          {/* Subcategory Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Subcategory">
            {subcategories.map((sub) => (
              <label
                key={sub}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tempSubCategory === sub}
                  onChange={() =>
                    setTempSubCategory(tempSubCategory === sub ? "" : sub)
                  }
                  className="w-4 h-4"
                />
                <span>{sub}</span>
              </label>
            ))}
          </Accordion>

          {/* Color Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Color">
            {colors.map((color) => (
              <label
                key={color.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tempColor === color.name}
                  onChange={() =>
                    setTempColor(tempColor === color.name ? "" : color.name)
                  }
                  className="w-4 h-4"
                />
                <span>{color.name}</span>
                <div
                  className="w-4 h-4 rounded-sm border"
                  style={{ backgroundColor: color.hex }}
                ></div>
              </label>
            ))}
          </Accordion>

          {/* Sizes Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Size">
            {sizes.map((size) => (
              <label
                key={size}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tempSize === size}
                  onChange={() => setTempSize(tempSize === size ? "" : size)}
                  className="w-4 h-4"
                />
                <span className="">{size}</span>
              </label>
            ))}
          </Accordion>

          {/* Price Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Price Range">
            <CustomPriceSlider
              priceRange={tempPriceRange} // Use temp state
              setPriceRange={setTempPriceRange} // Use temp setter
            />
          </Accordion>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 mt-5">
            <button
              className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
                            transition-all duration-300 btn-slide md:text-base text-sm w-full bg-primary5 "
              onClick={handleApplyFilters}
            >
              Apply Filter
            </button>
            <button
              className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary3 
                            transition-all duration-300 btn-slide2 md:text-base text-sm bg-primary5"
              onClick={handleClearFilters}
            >
              Clear Filter
            </button>
          </div>
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
      className="relative group cursor-pointer duration-300 hover:shadow-xl p-2 md:p-4 rounded-xl hover:-translate-y-3 transform-gpu"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      <Link to={`/shop/${data.id}`}>
        {/* Tags */}
        <div className="absolute top-4 left-4 md:top-7 md:left-7 flex flex-col gap-1 z-10">
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
          <img ref={imgRef} src={data.image} className="w-full  object-cover" />

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
                className={`cursor-pointer translate-y-2 w-7 h-7 md:w-10 md:h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-primary1 hover:text-white transition-all}`}
              >
                <Icon size={18} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <h3 className="mt-4 text-base md:text-lg font-bold product-title">
          {data.title}
        </h3>
        <p className="text-gray-700 mt-1">
          <span className="font-bold text-primary5 text-base md:text-lg">
            {data.price}
          </span>{" "}
          {data.oldPrice && (
            <del className="ml-2 text-gray-400">{data.oldPrice}</del>
          )}
        </p>
      </Link>
    </div>
  );
};
const CustomPriceSlider = ({ priceRange, setPriceRange }) => {
  const sliderRef = useRef(null);
  const MAX_PRICE = 10000; // use your real max price

  const calcValue = (pos) => {
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();

    let percent = (pos - rect.left) / rect.width;
    percent = Math.min(Math.max(percent, 0), 1);

    return Math.round(percent * MAX_PRICE);
  };

  const handleDrag = (e, type) => {
    const move = (ev) => {
      const value = calcValue(ev.clientX);

      if (type === "min") {
        if (value < priceRange[1] - 10) setPriceRange([value, priceRange[1]]);
      } else {
        if (value > priceRange[0] + 10) setPriceRange([priceRange[0], value]);
      }
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  const leftPercent = (priceRange[0] / MAX_PRICE) * 100;
  const rightPercent = (priceRange[1] / MAX_PRICE) * 100;

  return (
    <div className="w-full select-none px-2.5">
      <div
        className="relative h-2 bg-gray-300 rounded-full mt-3"
        ref={sliderRef}
      >
        {/* RANGE BAR */}
        <div
          className="absolute h-2 bg-primary5 rounded-full"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
          }}
        ></div>

        {/* LEFT THUMB */}
        <div
          className="absolute w-5 h-5 bg-primary5 rounded-full cursor-pointer -top-1.5"
          style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
          onMouseDown={(e) => handleDrag(e, "min")}
        ></div>

        {/* RIGHT THUMB */}
        <div
          className="absolute w-5 h-5 bg-primary5 rounded-full cursor-pointer -top-1.5"
          style={{ left: `${rightPercent}%`, transform: "translateX(-50%)" }}
          onMouseDown={(e) => handleDrag(e, "max")}
        ></div>
      </div>

      <p className="mt-2 text-sm font-medium">
        ₹{priceRange[0]} — ₹{priceRange[1]}
      </p>
    </div>
  );
};

export default ShopPage;
