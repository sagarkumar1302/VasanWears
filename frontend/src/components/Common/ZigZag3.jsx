import React from "react";

const ZigZag3 = () => {
  return (
    <section className="px-4 container mx-auto py-12 md:py-24 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Text Content */}
        <div className="order-2 md:order-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 border-l-4 border-primary5 pl-4">
              Our Vision
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our vision is to become a trusted destination for custom apparel —
              where{" "}
              <span className="text-gray-900 font-semibold">
                individuals, creators, startups, and businesses
              </span>{" "}
              can bring their ideas to life through clothing.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We aim to build a brand that stands for authenticity, creativity,
              and confidence, empowering people to express themselves through
              what they wear.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              More Than Just Clothing
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 leading-relaxed">
                At VasanWears, every design tells a story. Every garment carries
                a thought, a message, or a purpose.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From the meaning of our name to the way we create each product,
                VasanWears is about wearing your idea, your style, your
                identity.
              </p>
            </div>
          </div>

          {/* Final Tagline/Closing */}
          <div className="pt-6">
            {/* Added animate-butterfly class here */}
            <div className="bg-gray-900 p-6 md:p-8 rounded-2xl shadow-xl transform animate-butterfly transition-transform duration-300">
              <p className="text-white text-xl md:text-2xl font-bold text-center tracking-tight">
                VasanWears —{" "}
                <span className="text-primary5 uppercase tracking-wider">
                  Wear What You Imagine
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Image Content */}
        <div className="order-1 md:order-2 relative group">
          {/* Decorative Ring */}
          <div className="absolute inset-0 border-2 border-primary5/20 rounded-3xl scale-105 group-hover:scale-110 transition-transform duration-500"></div>

          <img
            src="/images/VasanNS.png"
            alt="VasanWears Vision"
            className="rounded-2xl w-full shadow-2xl relative z-10"
          />

          {/* Floating accent badge */}
          <div className="absolute -bottom-6 -left-6 bg-white shadow-lg p-4 rounded-xl hidden lg:block z-20 border border-gray-100">
            <p className="text-xs font-bold text-primary5 uppercase tracking-tighter">
              EST. 2025
            </p>
            <p className="text-sm font-bold text-gray-900">Bihar, India</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZigZag3;
