import React, { memo } from "react";
import enjoyVideo from "../../assets/videos/EnjoyYourProduct.mp4";

const HowItWorks = memo(() => {
  return (
    <section className="px-4 py-6 md:py-20 bg-white">
      <div className="container mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-primary2">
            How to create custom shirts
          </h2>
          <p className="text-primary5 mt-3 max-w-2xl mx-auto">
            Design your own custom T-shirt in just three easy steps — upload
            your design, customize and review it, then place your order and
            enjoy your personalized product.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-primary1/30"></div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center md:mb-20 mb-6">
            <img
              src="./AddCustomDesign.webp"
              className="rounded-xl "
              alt="Add custom design step"
              fetchpriority="high"
            />

            <div>
              <div className="w-15 h-15 flex items-center justify-center bg-linear-to-br from-primary4 to-primary3 text-primary2 text-2xl rounded-full mb-4 font-semibold">
                1
              </div>
              <h4 className="md:text-3xl text-2xl font-semibold mb-2">
                Add your shirt design
              </h4>
              <p className="text-primary5">
                Upload your artwork or add text and start designing. You can
                resize, move, and position your design exactly the way you want
                on the shirt.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center md:mb-20 mb-6 md:flex-row-reverse">
            <div className="md:order-2">
              <img
                src="./images/hiw1.webp"
                className="rounded-xl shadow-md"
                alt="Custom artwork review step"
                loading="lazy"
              />
            </div>

            <div className="md:order-1">
              <div className="w-15 h-15 flex items-center justify-center bg-linear-to-br from-primary4 to-primary3 text-primary2 text-2xl rounded-full mb-4 font-semibold">
                2
              </div>
              <h4 className="md:text-3xl text-2xl font-semibold mb-2">
                Custom artwork & review
              </h4>
              <p className="text-primary5">
                Adjust the design, preview it, and make sure everything looks
                perfect. Check the placement, size, and details before
                finalizing your design.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center ">
            {/* <img
              src="./images/htw2.jpg"
              className="rounded-xl shadow-md"
              alt="step"
            /> */}
            <div className="">
              <video
                src={enjoyVideo}
                loop
                muted
                autoPlay
                playsInline
                preload="metadata"
                className="border-primary3 border-2 rounded-xl block w-full h-full transform translate-z-0 outline-0 object-cover overflow-hidden"
                aria-label="Enjoy your custom product video"
              />
            </div>

            <div>
              <div className="w-15 h-15 flex items-center justify-center bg-linear-to-br from-primary4 to-primary3 text-primary2 text-2xl rounded-full mb-4 font-semibold">
                3
              </div>
              <h4 className="md:text-3xl text-2xl font-semibold mb-2">
                Enjoy your product
              </h4>
              <p className="text-primary5">
                Place your order and get your custom T-shirt delivered to your
                doorstep. Your shirt is printed with care and shipped safely to
                you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HowItWorks;
