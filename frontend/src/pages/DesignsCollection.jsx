import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { getAllDesignsApi, toggleLikeDesign } from "../utils/designApi";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import toast from "react-hot-toast";
import { RiHeart3Fill, RiHeart3Line, RiUser3Line } from "@remixicon/react";
import { useAuthStore } from "../store/useAuthStore";
import Loader from "../components/Common/Loader";
import Banner from "../components/Common/Banner";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const DesignsCollection = memo(() => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState({});
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    if (!loading && designs.length > 0) {
      animateCards();
    }
  }, [loading, designs]);

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllDesignsApi();

      // Map designs and add isLiked property based on current user
      const designsWithLikeStatus = (response.data || []).map((design) => ({
        ...design,
        isLiked: user ? design.likedBy?.includes(user._id) : false,
      }));

      setDesigns(designsWithLikeStatus);
    } catch (error) {
      toast.error("Failed to fetch designs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const animateCards = useCallback(() => {
    if (!containerRef.current || cardsRef.current.length === 0) return;

    // Hero title animation
    gsap.from(".hero-title", {
      duration: 1,
      y: -50,
      opacity: 0,
      ease: "power3.out",
    });

    // Cards stagger animation
    gsap.from(cardsRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
      duration: 0.8,
      y: 60,
      opacity: 0,
      stagger: 0.15,
      ease: "power3.out",
    });
  }, []);

  const handleLike = useCallback(async (designId, index) => {
    try {
      const response = await toggleLikeDesign(designId);

      // Update the designs state with new like count and re-sort
      setDesigns((prevDesigns) => {
        const updatedDesigns = prevDesigns.map((design) =>
          design._id === designId
            ? {
                ...design,
                likesCount: response.data.likesCount,
                isLiked: response.data.liked,
              }
            : design
        );

        // Sort by highest like count first, then by creation date
        return updatedDesigns.sort((a, b) => {
          if (b.likesCount !== a.likesCount) {
            return b.likesCount - a.likesCount;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });

      // Heart animation
      gsap.to(`.heart-${index}`, {
        scale: 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });

      toast.success(response.data.liked ? "Design liked!" : "Design unliked!");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to like designs");
      } else {
        toast.error("Failed to update like");
      }
      console.error(error);
    }
  }, []);

  const toggleFlip = useCallback((designId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [designId]: !prev[designId],
    }));
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="md:mt-35 mt-30">
      {/* Hero Section */}
      <Banner pageTitle="Designs Collection" />
      <div className="container mx-auto">
        {/* Designs Grid */}
        <div className="px-5 md:py-20 py-5" ref={containerRef}>
          {designs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No Designs Yet
              </h2>
              <p className="text-gray-500">
                Be the first to create and share a design!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designs.map((design, index) => (
                <div
                  key={design._id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group"
                >
                  {/* Design Image Container */}
                  <div className="relative h-80 bg-primary3 overflow-hidden">
                    <div
                      className={`absolute inset-0 transition-transform duration-700 ${
                        flippedCards[design._id] ? "rotate-y-180" : ""
                      }`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front Image */}
                      <div
                        className="absolute inset-0 backface-hidden"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        {design.images?.front ? (
                          <img
                            src={design.images.front}
                            alt={`${design.title} - Front view`}
                            loading="lazy"
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span>No Front Image</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          Front
                        </div>
                      </div>

                      {/* Back Image */}
                      {design.images?.back && (
                        <div
                          className="absolute inset-0 backface-hidden"
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                        >
                          <img
                            src={design.images.back}
                            alt={`${design.title} - Back view`}
                            loading="lazy"
                            className="w-full h-full object-contain p-4"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                            Back
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Flip Button */}
                    {design.images?.back && (
                      <button
                        onClick={() => toggleFlip(design._id)}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-primary5 px-4 py-2 rounded-full font-medium shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        {flippedCards[design._id]
                          ? "🔄 Show Front"
                          : "🔄 Show Back"}
                      </button>
                    )}

                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(design._id, index)}
                      className={`heart-${index} absolute cursor-pointer top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                        design.isLiked
                          ? "bg-primary5 text-white"
                          : "bg-white/90 backdrop-blur-sm text-primary5hover:bg-red-50"
                      }`}
                    >
                      {design.isLiked ? (
                        <RiHeart3Fill size={24} />
                      ) : (
                        <RiHeart3Line size={24} />
                      )}
                    </button>
                  </div>

                  {/* Design Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {design.title}
                    </h3>

                    {/* Creator Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <RiUser3Line size={16} />
                      <span>
                        By {design.createdBy?.fullName || "Anonymous"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-primary5 font-medium">
                        <RiHeart3Fill size={18} />
                        <span>
                          {design.likesCount || 0}{" "}
                          {design.likesCount === 1 ? "Like" : "Likes"}
                        </span>
                      </div>
                      <div className="text-primary5 font-bold text-lg">
                        ₹{design.sellPrice}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link
                      className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm w-full mt-5 cursor-pointer inline-block text-center"
                      to={`/designs-collections/${design._id}`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DesignsCollection;
