import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "@remixicon/react";

const slides = [
  {
    type: "video",
    url: "/videos/VasanWears.mp4",
    title: "",
  },
  {
    type: "image",
    url: "./images/slider.webp",
    title: "Make Your Design Now",
    button: "Shop Now",
  },
  {
    type: "video",
    url: "/videos/video1.mp4",
    title: "Exclusive Collection",
    button: "Shop Now",
  },
  {
    type: "image",
    url: "./images/slider2.webp",
    title: "NEW ARRIVALS",
    button: "Shop Now",
  },
];

const HeroSlider = memo(() => {
  const [current, setCurrent] = useState(0);
  const slideRef = useRef(null);
  const contentRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  const animateSlide = useCallback(() => {
    if (!slideRef.current || !contentRef.current) return;

    gsap.fromTo(
      slideRef.current,
      { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
    );

    gsap.fromTo(
      contentRef.current.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, delay: 0.2 }
    );
  }, []);

  useGSAP(
    () => {
      animateSlide();
    },
    { dependencies: [current], revertOnUpdate: true }
  );

  return (
    <div className="relative w-full h-[40vh] md:h-[40vh] xl:h-[80vh] overflow-hidden mt-30 md:mt-35">
      {/* Slide Media */}
      <div ref={slideRef} className="w-full h-full">
        {slides[current].type === "image" ? (
          <img
            src={slides[current].url}
            alt={slides[current].title || "Hero slider image"}
            loading="lazy"
            className="w-full h-full object-cover aspect-2/1"
            width="1200"
            height="600"
            fetchPriority="high"
          />
        ) : (
          <video
            src={slides[current].url}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            aria-label={slides[current].title || "Hero slider video"}
          />
        )}
        <div className="absolute inset-0 bg-black/40 z-8"></div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="absolute top-1/2 -translate-y-1/2 text-white text-right space-y-4 w-full flex flex-col justify-center items-center"
      >
        <h1 className="md:text-7xl text-3xl font-bold tracking-wide drop-shadow-lg md:mb-10 text-center">
          {slides[current].title}
        </h1>

        {slides[current].title.length > 0 && (
          <Link
            to="/shop"
            className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm"
          >
            {slides[current].button}
          </Link>
        )}
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-primary3 w-12 h-12 items-center justify-center rounded-full cursor-pointer hover:bg-primary1 hidden md:flex"
      >
        <RiArrowLeftLongLine />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-primary3 w-12 h-12 items-center justify-center rounded-full cursor-pointer hover:bg-primary1 hidden md:flex"
      >
        <RiArrowRightLongLine />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:flex space-x-3 hidden">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              i === current ? "bg-primary1" : "bg-primary3"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
});

export default HeroSlider;
