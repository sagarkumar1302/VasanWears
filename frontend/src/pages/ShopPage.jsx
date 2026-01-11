import React, { useState, useRef, useMemo, useEffect, useCallback, memo } from "react";
import { PRODUCTS } from "../utils/Products";
import gsap from "gsap";
import {
  getAllCategoriesForWebsite,
  getAllProductsForWebsite,
  getAllColorsForWebsite,
  getAllSizesForWebsite,
} from "../utils/productApi";
// ... (imports remain the same)
import Banner from "../components/Common/Banner";
import CustomSortDropdown from "../components/Common/CustomSortDropdown";
import { toggleWishlistApi, getWishlistApi } from "../utils/wishlistApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiHeartFill,
  RiHeartLine,
  RiSearch2Line,
  RiShoppingBagLine,
  RiSortAlphabetAsc,
  RiStarSmileLine,
} from "@remixicon/react";
import { Link } from "react-router-dom";
import Loader from "../components/Common/Loader";
import { useSearchParams } from "react-router-dom";

const ShopPage = () => {
  // --- MAIN FILTER STATE (Applied to finalProducts) ---
  const productsGridRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const query = searchParams.get("search") || "";
    const subCategoryParam = searchParams.get("subCategory") || "";
    const categoryParam = searchParams.get("category") || "";

    setSearchInput(query);
    setSearch(query);

    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam);
      setTempSubCategory(subCategoryParam);
    }

    if (categoryParam && categories.length > 0) {
      // Find category by name (case-insensitive)
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === categoryParam.toLowerCase()
      );

      if (matchedCategory) {
        setSelectedCategory(matchedCategory._id);
        setTempCategory(matchedCategory._id);
        // Clear subcategory when category is set from URL
        setSelectedSubCategory("");
        setTempSubCategory("");
      }
    }
  }, [searchParams, categories]);

  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await getWishlistApi();
        setWishlistProductIds(res.data.productIds || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [catRes, prodRes, colorRes, sizeRes] = await Promise.all([
          getAllCategoriesForWebsite(),
          getAllProductsForWebsite(),
          getAllColorsForWebsite(),
          getAllSizesForWebsite(),
        ]);

        setCategories(catRes.data);
        setProducts(prodRes.data);
        setColors(colorRes.data);
        setSizes(sizeRes.data);
      } catch (err) {
        console.error("Shop fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [sortType, setSortType] = useState("default");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2400]); // min to max price in ₹
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [tempSortType, setTempSortType] = useState(sortType);

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
    setTempSortType(sortType);
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedColor,
    selectedSize,
    priceRange,
    sortType,
  ]);
  useEffect(() => {
    if (isSliderOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSliderOpen]);
  // --- HANDLERS ---

  const handleApplyFilters = () => {
    // 1. Update main state with temporary state
    setSelectedCategory(tempCategory);
    setSelectedSubCategory(tempSubCategory);
    setSelectedColor(tempColor);
    setSelectedSize(tempSize);
    setPriceRange(tempPriceRange);
    setSortType(tempSortType);
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
    setTempSortType("default");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedColor("");
    setSelectedSize("");
    setPriceRange([0, 2400]);
    setSortType("default");

    // 2. Close the mobile filter panel
    sortingFilterMobileClose();
  };

  // --- (Rest of the component logic remains the same) ---
  const pageTitle = "Shop";

  // Extract unique filters

  // Convert ₹ price to number
  const numericPrice = (str) => parseFloat(str.replace("₹", ""));

  // Filtering + Sorting (Uses the MAIN state variables) - OPTIMIZED
  const finalProducts = useMemo(() => {
    if (products.length === 0) return [];

    const searchLower = search.trim().toLowerCase();
    const [minPrice, maxPrice] = priceRange;

    let data = products.filter((p) => {
      // Combined filter for better performance
      if (searchLower && !p.title.toLowerCase().includes(searchLower)) return false;
      if (selectedCategory && p.category?._id !== selectedCategory) return false;
      if (selectedSubCategory && p.subCategory?._id !== selectedSubCategory) return false;
      if (selectedColor && !p.colors.includes(selectedColor)) return false;
      if (selectedSize && !p.sizes.includes(selectedSize)) return false;
      
      const price = p.variants?.[0]?.salePrice ?? 0;
      if (price < minPrice || price > maxPrice) return false;

      return true;
    });

    // 🔃 SORT
    if (sortType === "low-to-high") {
      data.sort((a, b) => (a.variants?.[0]?.salePrice ?? 0) - (b.variants?.[0]?.salePrice ?? 0));
    } else if (sortType === "high-to-low") {
      data.sort((a, b) => (b.variants?.[0]?.salePrice ?? 0) - (a.variants?.[0]?.salePrice ?? 0));
    }

    return data;
  }, [
    products,
    search,
    selectedCategory,
    selectedSubCategory,
    selectedColor,
    selectedSize,
    priceRange,
    sortType,
  ]);
  useEffect(() => {
    if (!productsGridRef.current) return;

    const items = productsGridRef.current.querySelectorAll(".product-card");
    if (items.length === 0) return;

    // Debounce animation to prevent excessive re-renders
    const timer = setTimeout(() => {
      gsap.killTweensOf(items);

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.06,
        }
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [finalProducts]);

  const sortingFilterMobile = () => {
    // IMPORTANT: When opening, reset the temporary state to the current applied state
    setTempCategory(selectedCategory);
    setTempSubCategory(selectedSubCategory);
    setTempColor(selectedColor);
    setTempSize(selectedSize);
    setTempPriceRange(priceRange);
    setIsSliderOpen(true);
    const filterEl = document.querySelector(".mobile-filter");
    gsap.fromTo(
      filterEl,
      { y: "100%" }, // starting position
      { y: "0%", duration: 0.5, ease: "power3.out" }
    );
  };

  const sortingFilterMobileClose = () => {
    const filterEl = document.querySelector(".mobile-filter");
    setIsSliderOpen(false);
    gsap.fromTo(
      filterEl,
      { y: "0" }, // starting position
      { y: "100%", duration: 0.5, ease: "power3.out" }
    );
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);
  const handleToggleWishlist = useCallback(async (productId) => {
    if (wishlistLoadingId) return;

    try {
      setWishlistLoadingId(productId);

      const res = await toggleWishlistApi(productId);

      const updatedIds = res.data.items.map((i) => i.product.toString());
      setWishlistProductIds(updatedIds);

      toast.success(
        updatedIds.includes(productId)
          ? "Added to wishlist"
          : "Removed from wishlist"
      );
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", {
          state: { from: location.pathname },
        });
      } else {
        toast.error("Wishlist action failed");
      }
    } finally {
      setWishlistLoadingId(null);
    }
  }, [wishlistLoadingId, navigate]);

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="md:mt-35 mt-30">
      <Banner pageTitle={pageTitle} />

      <div className="container mx-auto px-5 py-5 md:py-20">
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
                <div key={cat._id}>
                  <label className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat._id}
                      onChange={() => {
                        setSelectedCategory(
                          selectedCategory === cat._id ? "" : cat._id
                        );
                        setSelectedSubCategory("");
                      }}
                    />
                    {cat.name}
                  </label>

                  {cat.subCategories?.length > 0 && (
                    <div className="ml-5 mt-1 space-y-1">
                      {cat.subCategories.map((sub) => (
                        <label
                          key={sub._id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubCategory === sub._id}
                            onChange={() => {
                              setSelectedCategory(cat._id);
                              setSelectedSubCategory(
                                selectedSubCategory === sub._id ? "" : sub._id
                              );
                            }}
                          />
                          {sub.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Accordion>

            {/* Subcategory Filter - DESKTOP */}

            {/* Color Filter - DESKTOP */}
            <Accordion title="Color">
              {colors.map((color) => (
                <label key={color._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedColor === color._id}
                    onChange={() =>
                      setSelectedColor(
                        selectedColor === color._id ? "" : color._id
                      )
                    }
                  />
                  <span>{color.name}</span>
                  <div
                    className="w-4 h-4 border rounded"
                    style={{ backgroundColor: color.hexCode }}
                  />
                </label>
              ))}
            </Accordion>

            {/* Sizes Filter - DESKTOP */}
            <Accordion title="Size">
              {sizes.map((size) => (
                <label key={size._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tempSize === size._id}
                    onChange={() =>
                      setTempSize(tempSize === size._id ? "" : size._id)
                    }
                  />
                  <span>{size.name}</span>
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
            <div
              ref={productsGridRef}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 min-h-[400px]"
            >
              {finalProducts.length === 0 ? (
                <p className="col-span-full text-center py-10">No products found.</p>
              ) : (
                finalProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    data={{
                      id: product._id,
                      title: product.title,
                      image: product.featuredImage,
                      hoverImage: product.hoverImage || product.featuredImage,
                      price: `₹${product.variants?.[0]?.salePrice ?? 0}`,
                      oldPrice: product.variants?.[0]?.regularPrice
                        ? `₹${product.variants[0].regularPrice}`
                        : null,
                      tags: product?.tags ? product?.tags : [],
                      slug: product.slug,
                    }}
                    isWishlisted={wishlistProductIds.includes(product._id)}
                    onToggleWishlist={() => handleToggleWishlist(product._id)}
                    loading={wishlistLoadingId === product._id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- MOBILE FILTER PANEL ----------------- */}
      <div className="md:hidden flex fixed inset-0 translate-y-full mobile-filter h-screen w-full z-100 overflow-y-hidden">
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
              <div key={cat._id}>
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat._id}
                    onChange={() => {
                      setSelectedCategory(
                        selectedCategory === cat._id ? "" : cat._id
                      );
                      setSelectedSubCategory("");
                    }}
                  />
                  {cat.name}
                </label>

                {cat.subCategories?.length > 0 && (
                  <div className="ml-5 mt-1 space-y-1">
                    {cat.subCategories.map((sub) => (
                      <label
                        key={sub._id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubCategory === sub._id}
                          onChange={() => {
                            setSelectedCategory(cat._id);
                            setSelectedSubCategory(
                              selectedSubCategory === sub._id ? "" : sub._id
                            );
                          }}
                        />
                        {sub.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Accordion>

          {/* Subcategory Filter - MOBILE (Uses TEMP state) */}

          {/* Color Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Color">
            {colors.map((color) => (
              <label key={color._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedColor === color._id}
                  onChange={() =>
                    setSelectedColor(
                      selectedColor === color._id ? "" : color._id
                    )
                  }
                />
                <span>{color.name}</span>
                <div
                  className="w-4 h-4 border rounded"
                  style={{ backgroundColor: color.hexCode }}
                />
              </label>
            ))}
          </Accordion>

          {/* Sizes Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Size">
            {sizes.map((size) => (
              <label key={size._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSize === size._id}
                  onChange={() =>
                    setSelectedSize(selectedSize === size._id ? "" : size._id)
                  }
                />
                <span>{size.name}</span>
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
          {/* Price High and Low Filter - MOBILE (Uses TEMP state) */}
          <Accordion title="Sort by Price">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tempSortType === "low-to-high"}
                onChange={() =>
                  setTempSortType(
                    tempSortType === "low-to-high" ? "default" : "low-to-high"
                  )
                }
                className="w-4 h-4"
              />
              <span>Low to High</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tempSortType === "high-to-low"}
                onChange={() =>
                  setTempSortType(
                    tempSortType === "high-to-low" ? "default" : "high-to-low"
                  )
                }
                className="w-4 h-4"
              />
              <span>High to Low</span>
            </label>
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

const ProductCard = memo(({ data, isWishlisted, onToggleWishlist, loading }) => {
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
      className="product-card relative group cursor-pointer duration-300 hover:shadow-xl p-2 md:p-4 rounded-xl hover:-translate-y-3 transform-gpu opacity-0"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      <Link to={`/shop/${data.id}/${data.slug}`}>
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
          <img 
            ref={imgRef} 
            src={data.image} 
            alt={data.title}
            loading="lazy"
            className="w-full object-cover" 
          />

          <img
            ref={hoverImgRef}
            src={data.hoverImage}
            alt={data.title}
            loading="lazy"
            className="w-full object-cover absolute inset-0 opacity-0"
          />

          {/* Icons */}
          <div
            className="absolute right-3 top-1/4 -translate-y-1/2 flex flex-col gap-3 opacity-0"
            ref={sideIconRef}
          >
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist();
              }}
              className="cursor-pointer translate-y-2 w-7 h-7 md:w-10 md:h-10 
             bg-white shadow-md rounded-full flex items-center justify-center 
             hover:bg-primary5 transition-all hover:text-white text-primary5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary5 border-t-transparent rounded-full animate-spin" />
              ) : isWishlisted ? (
                <RiHeartFill className="  " size={18} />
              ) : (
                <RiHeartLine className="" size={18} />
              )}
            </div>
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
});

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
