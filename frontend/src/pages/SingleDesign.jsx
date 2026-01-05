import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDesignByIdApi, toggleLikeDesign } from "../utils/designApi";
import { gsap } from "gsap";
import toast from "react-hot-toast";
import {
  RiHeart3Fill,
  RiHeart3Line,
  RiUser3Line,
  RiCalendarLine,
  RiArrowLeftLine,
  RiShoppingBag3Line,
} from "@remixicon/react";
import { useAuthStore } from "../store/useAuthStore";
import Loader from "../components/Common/Loader";

const SingleDesign = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("front");
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    fetchDesign();
  }, [designId]);

  useEffect(() => {
    if (!loading && design) {
      animateContent();
    }
  }, [loading, design]);

  const fetchDesign = async () => {
    try {
      setLoading(true);
      const response = await getDesignByIdApi(designId);
      const designData = {
        ...response.data,
        isLiked: user ? response.data.likedBy?.includes(user._id) : false,
      };
      setDesign(designData);
    } catch (error) {
      toast.error("Failed to fetch design details");
      console.error(error);
      navigate("/designs");
    } finally {
      setLoading(false);
    }
  };

  const animateContent = () => {
    const tl = gsap.timeline();

    tl.from(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    })
      .from(
        imageRef.current,
        {
          x: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3"
      )
      .from(
        detailsRef.current,
        {
          x: 100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.6"
      );
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like designs");
      return;
    }

    try {
      const response = await toggleLikeDesign(design._id);

      setDesign((prev) => ({
        ...prev,
        likesCount: response.data.likesCount,
        isLiked: response.data.liked,
      }));

      // Heart animation
      gsap.to(".like-btn", {
        scale: 1.2,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });

      toast.success(response.data.liked ? "Design liked!" : "Design unliked!");
    } catch (error) {
      toast.error("Failed to update like");
      console.error(error);
    }
  };

  const handleViewToggle = (view) => {
    if (view === currentView) return;

    gsap.to(imageRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => {
        setCurrentView(view);
        gsap.to(imageRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
        });
      },
    });
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen  flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Design Not Found
          </h2>
          <button
            onClick={() => navigate("/designs")}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Designs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:mt-35 mt-30 md:py-20 bg-linear-to-br from-primary3  to-primary3/20 py-5 px-4">
      <div className="container mx-auto" ref={containerRef}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/designs")}
          className="mb-6 flex items-center gap-2 text-primary2 font-medium transition-colors group"
        >
          <RiArrowLeftLine
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Gallery
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 md:p-8 p-5">
            {/* Image Section */}
            <div className="space-y-4" ref={imageRef}>
              <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center p-8">
                <img
                  src={
                    currentView === "front"
                      ? design.images?.front
                      : design.images?.back
                  }
                  alt={`${design.title} - ${currentView}`}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 capitalize">
                  {currentView} View
                </div>
              </div>

              {/* View Toggle Buttons */}
              {design.images?.back && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewToggle("front")}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                      currentView === "front"
                        ? "bg-linear-to-r from-primary5 to-primary1 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    onClick={() => handleViewToggle("back")}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                      currentView === "back"
                        ? "bg-linear-to-r from-primary5 to-primary1 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Back View
                  </button>
                </div>
              )}

              {/* Additional Images Preview */}
              {(design.images?.frontDesignArea ||
                design.images?.backDesignArea) && (
                <div className="grid grid-cols-2 gap-3">
                  {design.images?.frontDesignArea && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <img
                        src={design.images.frontDesignArea}
                        alt="Front Design Area"
                        className="w-full h-24 object-contain"
                      />
                      <p className="text-xs text-gray-600 text-center mt-2">
                        Front Design
                      </p>
                    </div>
                  )}
                  {design.images?.backDesignArea && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <img
                        src={design.images.backDesignArea}
                        alt="Back Design Area"
                        className="w-full h-24 object-contain"
                      />
                      <p className="text-xs text-gray-600 text-center mt-2">
                        Back Design
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col" ref={detailsRef}>
              <div className="flex-1">
                <h2 className="md:text-4xl sm:text-2xl text-xl font-bold text-gray-800 mb-4">
                  {design.title}
                </h2>

                {/* Creator Info */}
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <RiUser3Line size={20} />
                  <span className="text-lg">
                    Created by{" "}
                    <span className="font-semibold text-gray-800">
                      {design.createdBy?.fullName || "Anonymous"}
                    </span>
                  </span>
                </div>

                {/* Price */}
                <div className="bg-linear-to-r from-primary5 to-primary3 rounded-xl p-6 mb-6">
                  <p className="text-white mb-1">Price</p>
                  <p className="text-4xl font-bold text-white">
                    ₹{design.sellPrice}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary5 mb-1">
                      <RiHeart3Fill size={20} />
                      <span className="text-sm text-gray-600">Likes</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {design.likesCount || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary5 mb-1">
                      <RiCalendarLine size={20} />
                      <span className="text-sm text-gray-600">Created</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(design.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Visibility Status */}
                <div className="mb-6">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      design.isPublic
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {design.isPublic ? "🌍 Public Design" : "🔒 Private Design"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleLike}
                  className={`like-btn w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    design.isLiked
                      ? "bg-primary5 text-white hover:bg-primary5 shadow-lg"
                      : "bg-white border-2 border-primary5 text-primary5 hover:bg-red-50"
                  }`}
                >
                  {design.isLiked ? (
                    <RiHeart3Fill size={24} />
                  ) : (
                    <RiHeart3Line size={24} />
                  )}
                  {design.isLiked ? "Liked" : "Like Design"}
                </button>

                <button className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-primary4 to-primary3 text-primary2 py-4 rounded-xl font-semibold text-lg   transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <RiShoppingBag3Line size={24} />
                  Order This Design
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleDesign;
