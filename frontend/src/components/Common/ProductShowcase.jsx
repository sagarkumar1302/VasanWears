import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { RiHeartLine, RiHeartFill } from "@remixicon/react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllProductsForWebsite,
  getAllCategoriesForWebsite,
} from "../../utils/productApi";
import { getAllSubCategoriesApi } from "../../utils/subCategoryApi";
import { toggleWishlistApi, getWishlistApi } from "../../utils/wishlistApi";
import toast from "react-hot-toast";
import Loader from "../Common/Loader";

const ProductShowcase = memo(() => {
  const navigate = useNavigate();
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

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

        const [prodRes, subCatRes] = await Promise.all([
          getAllProductsForWebsite(),
          getAllSubCategoriesApi(),
        ]);

        setProducts(prodRes.data || []);
        setSubCategories(subCatRes.data || []);

        // 👇 set first subcategory as default tab
        if (subCatRes.data?.length) {
          setActiveSubCategory(subCatRes.data[0]._id);
        }
      } catch (err) {
        console.error("Showcase fetch error", err);
        setProducts([]);
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /** 🔥 FILTER PRODUCTS BY SUBCATEGORY - OPTIMIZED */
  const filteredProducts = useMemo(() => {
    if (!activeSubCategory || products.length === 0) return [];
    return products.filter((p) => p.subCategory?._id === activeSubCategory);
  }, [products, activeSubCategory]);

  const handleToggleWishlist = useCallback(
    async (productId) => {
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
    },
    [wishlistLoadingId, navigate]
  );

  if (loading) return <Loader />;

  if (filteredProducts.length === 0 && subCategories.length === 0) {
    return null;
  }

  return (
    <div className="px-5 w-full pb-5 pt-8 md:py-20 bg-white min-h-[600px]">
      <div className="container mx-auto">
        {/* Heading */}
        <div className="text-center mb-5 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Featured Products
          </h2>
          <p className="text-primary5 md:max-w-2xl mx-auto mt-3">
            Discover our latest collections handpicked for you.
          </p>

          {/* 🔥 SUBCATEGORY TABS */}
          <div className="flex md:justify-center mt-6 gap-4 overflow-x-auto py-2 scrollbar-hide">
            {subCategories.map((subCat) => (
              <button
                key={subCat._id}
                onClick={() => setActiveSubCategory(subCat._id)}
                className={`px-5 md:px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap
                ${
                  activeSubCategory === subCat._id
                    ? "bg-primary1 text-primary2"
                    : "bg-primary3/60 hover:bg-primary3"
                }`}
              >
                {subCat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              data={{
                id: product._id,
                title: product.title,
                slug: product.slug,
                image: product.featuredImage,
                hoverImage: product.hoverImage || product.featuredImage,
                price: `₹${product.variants?.[0]?.salePrice ?? 0}`,
                oldPrice: product.variants?.[0]?.regularPrice
                  ? `₹${product.variants[0].regularPrice}`
                  : null,
                tags: product.tags || [],
              }}
              isWishlisted={wishlistProductIds.includes(product._id)}
              onToggleWishlist={() => handleToggleWishlist(product._id)}
              loading={wishlistLoadingId === product._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// ---------------- PRODUCT CARD -----------------

const ProductCard = memo(
  ({ data, isWishlisted, onToggleWishlist, loading }) => {
    const imgRef = useRef(null);
    const hoverImgRef = useRef(null);
    const sideIconRef = useRef(null);

    // Individual refs for each card (very important!)
    const handleHoverIn = useCallback(() => {
      if (!sideIconRef.current || !hoverImgRef.current) return;

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
    }, []);

    const handleHoverOut = useCallback(() => {
      if (!sideIconRef.current || !hoverImgRef.current) return;

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
    }, []);

    return (
      <div
        // className="relative group cursor-pointer hover:scale-105 duration-300 hover:shadow-xl p-4 rounded-xl hover:-translate-y-3 transform-gpu"
        className="product-card relative group cursor-pointer duration-300 hover:shadow-xl p-2 md:p-4 rounded-xl hover:scale-[1.03]
will-change-transform transform-gpu"
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
          <div className="relative rounded-xl overflow-hidden aspect-3/4 bg-gray-100">
            <img
              ref={imgRef}
              src={data.image}
              alt={data.title}
              loading="lazy"
              className="w-full object-cover h-full"
            />

            <img
              ref={hoverImgRef}
              src={data.hoverImage}
              alt={data.title}
              loading="lazy"
              className="w-full object-cover absolute inset-0 opacity-0 h-full"
            />

            {/* Icons */}
            <div
              className="absolute right-3 top-1/4 -translate-y-1/2 flex flex-col gap-3 opacity-0 min-h-[120px]"
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
          <h3 className="mt-4 text-base md:text-lg font-bold product-title min-h-[48px]">
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
  }
);

export default ProductShowcase;
