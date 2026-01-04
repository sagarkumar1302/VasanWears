import React, { useEffect, useRef, useState } from "react";
import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import Banner from "../components/Common/Banner";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { getWishlistApi, toggleWishlistApi } from "../utils/wishlistApi";
import toast from "react-hot-toast";
import Loader from "../components/Common/Loader";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await getWishlistApi();

        setWishlistItems(res.data.items || []);
        setWishlistProductIds(res.data.productIds || []);
        console.log("WishList ",res);
        
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleToggleWishlist = async (productId) => {
    if (wishlistLoadingId) return;

    try {
      setWishlistLoadingId(productId);

      const res = await toggleWishlistApi(productId);
      const updatedIds = res.data.items.map((i) => i.product.toString());

      setWishlistProductIds(updatedIds);

      // 🔥 remove item immediately if un-wishlisted
      if (!updatedIds.includes(productId)) {
        setWishlistItems((prev) =>
          prev.filter((i) => i.product._id !== productId)
        );
      }

      toast.success(
        updatedIds.includes(productId)
          ? "Added to wishlist"
          : "Removed from wishlist"
      );
    } catch {
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoadingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="md:py-10 pt-10">
      <Banner pageTitle="Wishlist" />

      <div className="container mx-auto px-4 py-10">
        <h2 className="md:text-3xl text-2xl font-semibold mb-8 text-center">
          My Wishlist ({wishlistItems.length})
        </h2>

        {wishlistItems.length === 0 ? (
          <p className="text-center text-gray-500">Your wishlist is empty</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.product._id}
                data={item.product}
                isWishlisted={wishlistProductIds.includes(item.product._id)}
                loading={wishlistLoadingId === item.product._id}
                onToggleWishlist={() => handleToggleWishlist(item.product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
const ProductCard = ({ data, isWishlisted, onToggleWishlist, loading }) => {
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
      className="product-card relative group cursor-pointer duration-300 hover:shadow-xl p-2 md:p-4 rounded-xl hover:-translate-y-3 transform-gpu"
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
          <img ref={imgRef} src={data?.featuredImage} className="w-full  object-cover" />

          <img
            ref={hoverImgRef}
            src={data?.hoverImage}
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
          {data?.title}
        </h3>
        <p className="text-gray-700 mt-1">
          <span className="font-bold text-primary5 text-base md:text-lg">
            {data?.variants[0]?.salePrice}
          </span>{" "}
          {data?.variants[0]?.salePrice && (
            <del className="ml-2 text-gray-400">{data?.variants[0]?.regularPrice}</del>
          )}
        </p>
      </Link>
    </div>
  );
};
