import React, { useState, useEffect, useRef } from "react";
import { RiCloseLine, RiCoupon3Line, RiGiftLine } from "@remixicon/react";
import { getActiveCouponsApi } from "../../utils/couponApi";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import GiftBox from "../../assets/gif/GiftBoxPopup.gif"
const WelcomeOfferModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Check if modal has been shown before
    const hasSeenOffer = localStorage.getItem("hasSeenWelcomeOffer");

    if (!hasSeenOffer) {
      // Fetch active coupons
      fetchCoupons();
      // Show modal after a short delay for better UX
      setTimeout(() => {
        setIsOpen(true);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Animate in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: 50,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: 0.1,
        }
      );
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    try {
      const response = await getActiveCouponsApi();
      if (response.success) {
        // Get top 3 coupons
        setCoupons(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleClose = () => {
    // Animate out
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setIsOpen(false);
        // Mark as seen in localStorage
        localStorage.setItem("hasSeenWelcomeOffer", "true");
      },
    });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    // You can add a toast here if needed
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-primary5 
          hover:text-gray-600 transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <RiCloseLine size={28} />
        </button>

        {/* Header */}
        <div className="bg-linear-to-r from-primary1 to-primary1/60 text-white p-6 rounded-t-2xl text-center">
          <div className="flex justify-center mb-3">
            <img src={GiftBox} alt="Gift Box Pop Up" className="w-20" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to VasanWears!</h2>
          <p className="text-primary2/90 text-sm">
            🎉 Exclusive offers just for you!
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {coupons.length > 0 ? (
            <div className="space-y-3 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <RiCoupon3Line size={20} className="text-primary1" />
                Available Coupons
              </h3>
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="border border-primary1/20 rounded-lg p-3 bg-primary1/5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-bold text-primary5 text-lg">
                        {coupon.code}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {coupon.description ||
                          `${
                            coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`
                          }`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        copyCode(coupon.code);
                        handleClose();
                      }}
                      className="bg-primary1 text-primary5 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary1/90 transition-all cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Get amazing deals on custom designed apparel!
              </p>
              <div className="bg-primary1/10 rounded-lg p-4">
                <p className="font-semibold text-primary1">
                  ✨ Free shipping on orders above ₹999
                </p>
              </div>
            </div>
          )}

          <Link
            to="/shop"
            onClick={handleClose}
            className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer inline-block text-center "
          >
            Start Shopping
          </Link>

          <p className="text-xs text-gray-500 text-center mt-3">
            This popup will only show once
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOfferModal;
