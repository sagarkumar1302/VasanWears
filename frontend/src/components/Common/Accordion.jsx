import { useRef, useState } from "react";
import gsap from "gsap"
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
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
    <div className="border-b mt-3 py-3 md:pb-3 md:py-0 border-b-primary1/50">
      <button
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center text-left font-semibold text-sm cursor-pointer"
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
        <div className="pt-2 flex flex-col gap-1">{children}</div>
      </div>
    </div>
  );
};
export default Accordion;