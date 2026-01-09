import React from "react";

const ZigZag = () => {
  return (
    <section className="px-4 container mx-auto py-10 md:py-20 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Text Content */}
        <div className="order-2 md:order-1 space-y-6">
          <div className="inline-block px-4 py-1.5 bg-primary5/10 text-primary5 rounded-full text-sm font-bold tracking-widest uppercase">
            Our Identity
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            About <span className="text-primary5">VasanWears</span>
          </h2>

          <p className="text-base text-gray-600 leading-relaxed">
            VasanWears is a movement centered on identity. We believe that
            clothing transcends fabric—it is a powerful medium for
            <span className="font-semibold text-gray-900 ml-1">
              expression, individuality, and confidence.
            </span>
          </p>

          <div className="relative p-6 bg-gray-50 rounded-2xl border-l-4 border-primary5 shadow-sm">
            <p className="text-base text-gray-700 italic leading-relaxed">
              "The name <span className="font-bold text-primary5">Vasan</span>{" "}
              comes from the Sanskrit word
              <span className="font-bold"> “Vastra”</span>, which means clothing
              or attire. We chose this name to stay connected to our roots and
              culture. Sanskrit, the language of our ancestors, carries history,
              meaning, and depth — and VasanWears brings that legacy into modern
              fashion."
            </p>
            
          </div>
          <div className="pt-6 pb-2">
            <p className="text-gray-700 leading-relaxed">
              Founded by{" "}
              <span className="font-semibold text-primary5">Nikhil Verma</span>{" "}
              and{" "}
              <span className="font-semibold text-primary5">Sagar Kumar,</span>{" "}
              VasanWears was born from an idea envisioned by Nikhil and brought
              to life through Sagar’s execution—together shaping a platform
              where creativity becomes wearable identity.
            </p>
          </div>
          <div className="pt-4 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
            <p className="text-gray-600 leading-relaxed">
              VasanWears was created with a simple yet powerful idea:
              <span className="block text-gray-900 font-medium mt-1">
                to give everyone the freedom to wear what they imagine.
              </span>
            </p>
            <p className="text-gray-600 leading-relaxed">
              In a world of mass-produced fashion, we wanted to build a platform
              where creativity comes first. Whether it’s a personal idea, a
              brand logo, a meaningful quote, or a custom design, VasanWears
              makes it easy to turn ideas into wearable apparel.
            </p>
          </div>
        </div>

        {/* Image Content */}
        <div className="order-1 md:order-2 relative group">
          {/* Decorative Ring */}
          <div className="absolute inset-0 border-2 border-primary5/20 rounded-3xl scale-105 group-hover:scale-110 transition-transform duration-500"></div>

          <img
            src="/images/VasanNS.webp"
            alt="VasanWears Vision"
            className="rounded-2xl w-full shadow-2xl relative z-10"
          />

</div>
      </div>
    </section>
  );
};

export default ZigZag;
