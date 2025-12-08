import React from "react";

const Banner = () => {
  return (
    <section
      className="w-full h-[250px] md:h-[350px] bg-center bg-cover relative flex items-center justify-center mt-20 md:mt-26 bg-fixed"
      style={{ backgroundImage: "url('/images/slider2.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-3xl md:text-5xl font-bold">Page Title</h1>

        {/* Breadcrumb */}
        <p className="text-sm md:text-base mt-2">
          Home <span className="mx-2">/</span> Page Title
        </p>
      </div>
    </section>
  );
};

export default Banner;
