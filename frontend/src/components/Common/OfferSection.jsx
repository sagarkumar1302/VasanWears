import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { RiArrowRightLine } from "@remixicon/react";

const OfferSection = () => {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const marquees = marqueeRef.current.querySelectorAll(".marquee-item");
    const arrows = marqueeRef.current.querySelectorAll(".marquee-arrow");

    const animateForward = () => {
      gsap.to(marquees, {
        x: "-200%",
        duration: 4,
        repeat: -1,
        ease: "none",
      });

      gsap.to(arrows, {
        rotate: 0,
        duration: 0.3,
      });
    };

    const animateBackward = () => {
      gsap.to(marquees, {
        x: "0%",
        duration: 4,
        repeat: -1,
        ease: "none",
      });

      gsap.to(arrows, {
        rotate: 180,
        duration: 0.3,
      });
    };

    let touchStartY = 0;

    // Desktop scroll
    const wheelListener = (e) => {
      if (e.deltaY < 0) {
        animateBackward();
      } else {
        animateForward();
      }
    };

    // Mobile swipe
    const touchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const touchMove = (e) => {
      const touchEndY = e.touches[0].clientY;

      if (touchEndY < touchStartY) {
        // swipe UP ➝ forward
        animateForward();
      } else {
        // swipe DOWN ➝ backward
        animateBackward();
      }
    };

    window.addEventListener("wheel", wheelListener);
    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchmove", touchMove);

    // initial start
    animateForward();

    return () => {
      window.removeEventListener("wheel", wheelListener);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
    };
  }, []);

  return (
    <div className="w-full bg-white">
      <div
        ref={marqueeRef}
        className="flex overflow-hidden bg-primary4 select-none"
      >
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="marquee-item flex shrink-0 items-center gap-6 px-10 md:py-4"
            >
              <h1 className="text-2xl md:text-4xl uppercase font-semibold whitespace-nowrap">
                Buy 2 Get 1 Free. And 25% Off using DISC18
              </h1>

              <RiArrowRightLine
                size={60}
                className="marquee-arrow transition-all"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default OfferSection;
