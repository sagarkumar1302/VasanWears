import React, { memo } from "react";
import {
  RiBrushLine,
  RiImageLine,
  RiFontSize2,
  RiPaletteLine,
} from "@remixicon/react";
import Design from "../../assets/images/slider.webp"
import Customize from "../../assets/images/slider2.webp"
import OurVPreviewision from "../../assets/images/slider3.webp"

const features = [
  {
    title: "Design Your Apparel, Effortlessly",
    shortTitle: "Design",
    desc: "Create custom T-shirts, hoodies, and sweatshirts using our simple online designer. Upload your artwork, explore ready-to-use elements, and see your design come to life instantly.",
    icon: <RiBrushLine size={42} className="text-primary" />,
    img: Design,
  },
  {
    title: "Customize With Fonts & Graphics",
    shortTitle: "Customize",
    desc: "Personalize your apparel with fonts, custom font uploads, graphics, and ready-made presets. Preview your design instantly and order with confidence — no design experience needed.",
    icon: <RiFontSize2 size={42} className="text-primary" />,
    img: Customize,
  },
  {
    title: "Preview & Order With Confidence",
    shortTitle: "Preview & Order",
    desc: "See exactly how your design will look before placing your order. Make final adjustments, review every detail, and order your custom apparel with complete confidence.",
    icon: <RiImageLine size={42} className="text-primary" />,
    img: OurVPreviewision,
  },
];

const ZigZagFeatures = memo(() => {
  return (
    <section className="py-5 md:py-20 bg-white px-4">
      <div className="container mx-auto  space-y-8 md:space-y-24">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex flex-col lg:flex-row items-center gap-5 md:gap-10 ${
              i % 2 !== 0 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Left/Right Image */}
            <div className="w-full lg:w-1/2">
              <div className="bg-primary4/50 rounded-3xl p-4 shadow-lg">
                <img
                  src={f.img}
                  alt={f.title}
                  loading="lazy"
                  className="rounded-2xl w-full h-full object-cover aspect-2/1"
                />
              </div>
            </div>

            {/* Left/Right Text */}
            <div className="w-full lg:w-1/2">
              <div className="bg-primary4 w-fit p-2 rounded-md font-bold mb-5">
                <h6>{f.shortTitle}</h6>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="md:text-5xl text-3xl font-semibold white">
                  {f.title}
                </h2>
              </div>
              <p className="text-primary5 text-lg leading-relaxed">{f.desc}</p>

              {/* Feature badges */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 bg-primary3  rounded-xl px-2 py-3">
                  <RiPaletteLine className="" size={28} />
                  <span className="font-medium">Free Icons</span>
                </div>

                <div className="flex items-center gap-2 bg-primary3  rounded-xl px-2 py-3">
                  <RiImageLine className="text-primary" size={28} />
                  <span className="font-medium">Free Images</span>
                </div>

                <div className="flex items-center gap-2 bg-primary3  rounded-xl px-2 py-3">
                  <RiFontSize2 className="text-primary" size={28} />
                  <span className="font-medium">Font Library</span>
                </div>

                <div className="flex items-center gap-2 bg-primary3  rounded-xl px-2 py-3">
                  <RiBrushLine className="text-primary" size={28} />
                  <span className="font-medium">Quick Designs</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default ZigZagFeatures;
