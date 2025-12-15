import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { RiArrowRightLine } from "@remixicon/react";

const OfferSection = () => {
  const marqueeRef = useRef(null);
  const tlRef = useRef(null);
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const wheelTimeout = useRef(null);

  useEffect(() => {
    const container = marqueeRef.current;
    const items = gsap.utils.toArray(".marquee-item");
    const arrows = container.querySelectorAll(".marquee-arrow");

    let speed = 2; // base speed
    let direction = 1;
    let x = 0;

    let totalWidth = 0;
    items.forEach((el) => (totalWidth += el.offsetWidth));

    const wrap = gsap.utils.wrap(-totalWidth / 2, 0);

    gsap.ticker.add(() => {
      x += speed * direction;
      gsap.set(items, { x: wrap(x) });
    });

    const setDirection = (dir) => {
      direction = dir;
      gsap.to(arrows, {
        rotate: dir === 1 ? 0 : 180,
        duration: 0.3,
      });
    };

    const onWheel = (e) => {
      setDirection(e.deltaY > 0 ? 1 : -1);
    };

    let startY = 0;
    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      setDirection(e.touches[0].clientY < startY ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      gsap.ticker.remove(() => {});
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden bg-white">
      <div ref={marqueeRef} className="flex bg-primary4 whitespace-nowrap">
        {[...Array(2)].map((_, block) =>
          Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={`${block}-${i}`}
                className="marquee-item flex shrink-0 items-center gap-6 px-10 py-2 md:py-4"
              >
                <h1 className="text-2xl md:text-3xl uppercase font-semibold">
                  Buy 2 Get 1 Free. And 25% Off using DISC18
                </h1>

                <RiArrowRightLine className="marquee-arrow w-8 h-8 md:w-12 md:h-12" />
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default OfferSection;
