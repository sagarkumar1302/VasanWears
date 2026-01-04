import {
  RiArrowDownSLine,
  RiArrowLeftLongLine,
  RiArrowRightLongLine,
  RiArrowUpSLine,
  RiHeartFill,
  RiHeartLine,
} from "@remixicon/react";
import credits1 from "../assets/gif/Credits1.gif";
import credits2 from "../assets/gif/Credits2.gif";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import gsap from "gsap";
import { useParams, useSearchParams } from "react-router-dom";

import { getProductBySlugApi } from "../utils/productApi";
import Loader from "../components/Common/Loader";
import { toggleWishlistApi, getWishlistApi } from "../utils/wishlistApi";
import { useNavigate } from "react-router-dom";
import { addToCartApi } from "../utils/cartApi";
import toast from "react-hot-toast";
const serviceablePincodes = {
  110001: "2–4 Days",
  400001: "3–5 Days",
  700001: "4–6 Days",
  560001: "2–3 Days",
};
const SIZE_ORDER = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  XXXL: 7,
};
const SingleProductPage = () => {
  const { id, slug } = useParams();
  const [searchParams] = useSearchParams();
  const variantFromUrl = searchParams.get("variant");
  const sizeFromUrl = searchParams.get("size");
  const navigate = useNavigate();
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cartCount, setCartCount] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const fetchCart = useCartStore((s) => s.fetchCart);
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await getWishlistApi();
        setWishlistProductIds(res.data.productIds || []);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error(err);
        }
      }
    };
    fetchWishlist();
  }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductBySlugApi(slug);

        setProduct(res.data);
      } catch (err) {
        console.error("Single product error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);
  useEffect(() => {
    if (!product) return;

    /* ========= VARIANT (COLOR) ========= */
    let finalVariant = product.variants[0];

    if (variantFromUrl) {
      const foundVariant = product.variants.find(
        (v) => v._id === variantFromUrl
      );
      if (foundVariant) {
        finalVariant = foundVariant;
      }
    }

    setSelectedVariant(finalVariant);
    setSelectedColor(finalVariant.color);

    /* ========= SIZE (INDEPENDENT) ========= */
    let finalSize = product.sizes?.[0]?._id || null;

    if (sizeFromUrl) {
      const foundSize = product.sizes.find((s) => s._id === sizeFromUrl);
      if (foundSize) {
        finalSize = foundSize._id;
      }
    }

    setSelectedSize(finalSize);

    setSelectedIndex(0);
  }, [product, variantFromUrl, sizeFromUrl]);

  const isWishlisted = wishlistProductIds.includes(product?._id);

  const handleToggleWishlist = async () => {
    if (!product || wishlistLoading) return;

    const wasWishlisted = isWishlisted;

    try {
      setWishlistLoading(true);

      const res = await toggleWishlistApi(product._id);

      const updatedIds = res.data.items.map((item) => item.product.toString());

      setWishlistProductIds(updatedIds);
      
      if (wasWishlisted) {
        toast.success("Removed from wishlist");
      } else {
        toast.success("Added to wishlist");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", {
          state: { from: `/product/${slug}` }, // optional redirect back
        });
      } else {
        toast.error("Failed to update wishlist");
        console.error("Wishlist error:", err);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const sortedSizes = useMemo(() => {
    if (!product?.sizes) return [];

    return [...product.sizes].sort((a, b) => {
      // Handle named sizes (S, M, L...)
      if (SIZE_ORDER[a.name] && SIZE_ORDER[b.name]) {
        return SIZE_ORDER[a.name] - SIZE_ORDER[b.name];
      }

      // Handle numeric sizes (28, 30, 32...)
      if (!isNaN(a.name) && !isNaN(b.name)) {
        return Number(a.name) - Number(b.name);
      }

      // Fallback
      return a.name.localeCompare(b.name);
    });
  }, [product]);

  const media = useMemo(() => {
    if (!selectedVariant) return [];

    const images = [];

    if (selectedVariant.featuredImage) {
      images.push({
        type: "image",
        src: selectedVariant.featuredImage,
      });
    }

    selectedVariant.gallery?.forEach((g) => {
      images.push({
        type: g.type,
        src: g.url,
      });
    });

    return images;
  }, [selectedVariant]);

  const selectedMedia = media[selectedIndex];

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
  const handleColorChange = (colorId) => {
    const variant = product.variants.find(
      (v) =>
        v.color?._id?.toString() === colorId || v.color?.toString() === colorId
    );

    if (!variant) return;

    setSelectedVariant(variant);
    setSelectedColor(colorId);
    setSelectedIndex(0);

    navigate(
      `/shop/${product._id}/${product.slug}?variant=${variant._id}&size=${selectedSize}`,
      { replace: true }
    );
  };

  const handleSizeChange = (sizeId) => {
    setSelectedSize(sizeId);

    // 🔗 Update URL (KEEP VARIANT)
    navigate(
      `/shop/${product._id}/${product.slug}?variant=${selectedVariant._id}&size=${sizeId}`,
      { replace: true }
    );
  };

  const [showVideo, setShowVideo] = useState(false);
  const videoOverlayRef = useRef(null);
  const videoBoxRef = useRef(null);
  const openVideo = () => {
    setShowVideo(true);

    requestAnimationFrame(() => {
      gsap.fromTo(
        videoOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
        videoBoxRef.current,
        { scale: 0.8, y: 50, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    });

    document.body.style.overflow = "hidden";
  };

  const closeVideo = () => {
    gsap.to(videoBoxRef.current, {
      scale: 0.8,
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
    });

    gsap.to(videoOverlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setShowVideo(false);
        document.body.style.overflow = "auto";
      },
    });
  };
  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedSize) {
      toast.error("Select color and size");
      return;
    }

    try {
      toast.loading("Adding to cart...");
      await addToCartApi({
        itemType: "catalog",
        productId: product._id,
        variantId: selectedVariant._id,
        colorId: selectedColor,
        sizeId: selectedSize,
        quantity: cartCount,
      });

      toast.dismiss();
      await fetchCart();
      toast.success("Added to cart");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    name: "",
    rating: 0,
    comment: "",
  });

  const reviewOverlayRef = useRef(null);
  const reviewBoxRef = useRef(null);
  const openReviewModal = () => {
    setShowReviewModal(true);

    requestAnimationFrame(() => {
      gsap.fromTo(
        reviewOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
        reviewBoxRef.current,
        { scale: 0.8, y: 50, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
        }
      );
    });

    document.body.style.overflow = "hidden";
  };

  const closeReviewModal = () => {
    gsap.to(reviewBoxRef.current, {
      scale: 0.8,
      y: 50,
      opacity: 0,
      duration: 0.3,
    });

    gsap.to(reviewOverlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setShowReviewModal(false);
        document.body.style.overflow = "auto";
      },
    });
  };
  const submitReview = () => {
    if (!reviewData.name || !reviewData.comment || reviewData.rating === 0) {
      alert("Please fill all fields");
      return;
    }

    setReviews((prev) => [
      ...prev,
      {
        ...reviewData,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
      },
    ]);

    setReviewData({ name: "", rating: 0, comment: "" });
    closeReviewModal();
  };
  if (loading) return <Loader />;
  if (!product) return null;

  return (
    <div className="px-5 py-5 md:py-20 mt-30 md:mt-35">
      <div className="container mx-auto">
        <div className="md:pb-6 pb-4 md:flex gap-1 sm:gap-4 md:text-base text-sm whitespace-nowrap hidden">
          <span>
            <Link to="/">Home</Link>
          </span>
          <span>&gt;</span>
          <span> {product?.category?.name}</span>
          {product?.subCategory && (
            <>
              <span>&gt;</span>
              <span>{product?.subCategory?.name}</span>
            </>
          )}
          <span>&gt;</span>
          <span>{product.title}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT SECTION */}
          <div className="flex gap-4 md:flex-row flex-col-reverse">
            {/* Thumbnails */}
            <div className="flex flex-row md:flex-col gap-3 overflow-auto md:overflow-visible  scrollbar-hide">
              {media.map((m, i) => (
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
            <div className="relative w-full h-[450px] md:h-fit xl:h-[800px] bg-[#faf7f2] rounded-xl overflow-hidden">
              {selectedMedia?.type === "image" ? (
                <img
                  src={selectedMedia?.src}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={selectedMedia?.src}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )}

              {/* Slider Controls */}
              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === 0 ? media.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white w-12 h-12 items-center justify-center rounded-full cursor-pointer hover:bg-primary1 flex"
              >
                <RiArrowLeftLongLine className="lg:h-6 lg:w-6 w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === media.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white w-12 h-12 items-center justify-center rounded-full cursor-pointer hover:bg-primary1 flex"
              >
                <RiArrowRightLongLine className="lg:h-6 lg:w-6 w-5 h-5" />
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className="absolute top-4 right-4 cursor-pointer z-10 flex items-center justify-center"
              >
                {wishlistLoading ? (
                  <span className="w-6 h-6 border-2 border-primary1 border-t-transparent rounded-full animate-spin"></span>
                ) : isWishlisted ? (
                  <RiHeartFill className="xl:h-8 xl:w-8 w-5 h-5 text-primary5 transition" />
                ) : (
                  <RiHeartLine className="xl:h-8 xl:w-8 w-5 h-5 hover:text-primary1 transition" />
                )}
              </button>
              <div className="absolute bottom-5 right-5 bg-white px-2 py-1 rounded-xl">
                {product?.credits?.fullName ? (
                  <Link
                    to={`/designs-collections/users/${product?.credits?._id}`}
                    className="flex justify-center items-center gap-2"
                  >
                    <img src={credits1} alt="Credits" className="w-10" />

                    <span>Credit by </span>
                    <span className="font-bold">
                      {product?.credits?.fullName}
                    </span>
                  </Link>
                ) : (
                  <div className="flex gap-2 items-center justify-center">
                    <img src={credits1} alt="Credits" className="w-10" />
                    <span className="font-bold">By VasanWears</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-4xl font-semibold mb-2">
              {product.title}
            </h2>
            <p className="text-base text-primary5 mb-4">
              {product.description}
            </p>
            <p className="text-xl font-bold text-primary5 mb-4">
              ₹{selectedVariant?.salePrice}
              <del className="ml-2 text-gray-400">
                ₹{selectedVariant?.regularPrice}
              </del>
            </p>

            {/* Colors */}
            <div className="mb-4">
              <p className="font-medium mb-3">Color:</p>
              <div className="flex gap-4 ">
                {product.colors.map((color) => (
                  <div
                    key={color._id}
                    style={{ backgroundColor: color.hexCode }}
                    onClick={() => handleColorChange(color._id)}
                    className={`w-8 h-8 rounded-full cursor-pointer border
      ${
        selectedColor === color._id
          ? "border-primary5 border-2 scale-110"
          : "border-primary2/40"
      }
    `}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <p className="font-medium mb-3">Size:</p>
              <div className="flex flex-wrap gap-2">
                {sortedSizes.map((size) => (
                  <button
                    key={size._id}
                    onClick={() => handleSizeChange(size._id)}
                    className={`px-4 py-1 border rounded
      ${
        selectedSize === size._id
          ? "bg-primary5 text-white border-primary5"
          : "bg-white text-primary5 border-primary2/10 hover:bg-primary1 hover:text-white"
      }
    `}
                  >
                    {size.name}
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
                onClick={handleAddToCart}
              >
                Add To Cart
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to={`/design?category=${product?.category?._id}${
                  product?.subCategory
                    ? `&subcategory=${product.subCategory._id}`
                    : ""
                }`}
                className="py-2.5 px-8 rounded-xl font-semibold text-primary3 
transition-all duration-300 btn-slide2 md:text-base text-sm"
              >
                Design Your Tshirt
              </Link>

              <button
                onClick={openVideo}
                className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
    transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer"
              >
                Watch Tutorials
              </button>
            </div>

            {/* Share */}
            {/* Pincode Checker */}
            <div className="mt-6 hidden">
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

            {/* {activeTab === "reviews" && (
              <div>
                <p>No reviews yet.</p>
                <button className="mt-4 px-5 py-2 bg-black text-white rounded">
                  Write a Review
                </button>
              </div>
            )} */}
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
            {/* <Accordion title="Reviews">
              <div>
                <p>No reviews yet.</p>
                <button className="mt-4 px-5 py-2 bg-black text-white rounded">
                  Write a Review
                </button>
              </div>
            </Accordion> */}
          </div>
        </div>
        <div id="review" className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>

          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border rounded-lg p-4 bg-primary3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-primary5">{r.date}</p>
                  </div>

                  <div className="flex gap-1 text-yellow-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                    ))}
                  </div>

                  <p className="mt-2 text-primary5">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openReviewModal}
            className="mt-6 px-5 py-2 bg-black text-white rounded cursor-pointer"
          >
            Write a Review
          </button>
        </div>
      </div>
      {showVideo && (
        <div
          ref={videoOverlayRef}
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center px-4"
        >
          {/* Video Box */}
          <div
            ref={videoBoxRef}
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute top-3 right-3 z-10 bg-white text-black 
        rounded-full w-10 h-10 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Video */}
            <video
              src="/images/dummy/video1.mp4"
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      {showReviewModal && (
        <div
          ref={reviewOverlayRef}
          className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center px-4"
        >
          <div
            ref={reviewBoxRef}
            className="bg-white w-full max-w-md rounded-xl p-6 relative"
          >
            <button
              onClick={closeReviewModal}
              className="absolute top-3 right-3 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

            {/* Name */}
            <input
              type="text"
              placeholder="Your Name"
              value={reviewData.name}
              onChange={(e) =>
                setReviewData({ ...reviewData, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            />

            {/* Rating */}
            <div className="flex gap-1 mb-3 text-2xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={
                    star <= reviewData.rating
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>

            {/* Comment */}
            <textarea
              placeholder="Write your review..."
              value={reviewData.comment}
              onChange={(e) =>
                setReviewData({ ...reviewData, comment: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-4 resize-none"
              rows="4"
            />

            <button
              onClick={submitReview}
              className="w-full bg-black text-white py-2 rounded"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
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
