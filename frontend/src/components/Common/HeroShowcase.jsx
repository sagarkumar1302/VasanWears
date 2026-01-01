import React from "react";
import { Link } from "react-router-dom";

const HeroShowcase = () => {
  return (
    <section className="px-5 bg-primary3/60 py-6 md:py-20">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT SIDE IMAGES */}
        <div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Free and easy way to bring your ideas to life
          </h2>

          <p className="text-primary5 mt-4 max-w-md mb-8">
            Design your own custom T-shirt in minutes using our easy-to-use
            online designer. Upload your artwork, customize the layout, preview
            instantly, and place your order with confidence.
          </p>
          <Link
            to="/shop"
            className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm"
          >
            Get Started
          </Link>
        </div>

        {/* RIGHT CONTENT */}

        <div className="relative flex justify-center items-center md:py-10 py-20">
          {/* Background illustrations */}
          <img
            src="/images/hero2.jpg"
            className="absolute top-0 md:top-4 left-0 rounded-xl shadow-md w-30 md:w-40 xl:w-60"
          />
          <img
            src="/images/hiw1.jpeg"
            className="absolute bottom-3 md:bottom-10 left-0 md:left-3 rounded-xl shadow-md w-40 md:w-80"
          />
          <img
            src="/images/hero3.jpg"
            className="absolute top-4 md:top-20 right-3 xl:right-5 rounded-xl shadow-md md:w-60 w-40"
          />
          <img
            src="/images/hero1.jpg"
            className="absolute right-0 bottom-0 rounded-xl shadow-md w-30 xl:w-60"
            alt="htw2"
          />

          {/* Central Product Card */}
          <div className="relative bg-white p-6 rounded-2xl shadow-xl w-[320px] md:w-[250px] xl:w-[350px] z-10 md:block flex gap-4">
            <img
              src="/images/hero4.png"
              className="rounded-lg mb-4 w-30 h-35 md:w-full md:h-full object-cover"
            />

            {/* Dummy details */}
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>

              {/* Colors */}
              <div className="flex gap-3 mt-4">
                <div className="w-6 h-6 bg-primary1 rounded-full"></div>
                <div className="w-6 h-6 bg-primary4 rounded-full"></div>
                <div className="w-6 h-6 bg-primary3 rounded-full"></div>
              </div>

              {/* Button */}
              <Link to="/shop" className="py-2.5 px-4 md:px-8 rounded-xl font-semibold text-primary2 transition-all duration-300 btn-slide md:text-base text-sm w-full block text-center">
                See Your Idea on Apparel
              </Link>
            </div>
          </div>

          {/* Tools Sidebar */}
          {/* <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
            <button className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center border">
              ✏️
            </button>

            <button className="w-12 h-12 bg-green-500 text-white shadow-lg rounded-lg flex items-center justify-center">
              🎨
            </button>

            <button className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center border">
              T
            </button>

            <button className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center border">
              🖼️
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroShowcase;

// {/* RIGHT CONTENT */}

//         <div className="relative flex justify-center items-center h-130">
//           {/* Background illustrations */}
//           <img
//             src="./images/slider2.jpg"
//             className="absolute top-0 w-80 left-10 rounded-xl shadow-md"
//           />
//           <img
//             src="./images/htw2.jpg"
//             className="absolute bottom-0 w-80 left-0 rounded-xl shadow-md"
//           />
//           <img
//             src="./images/slider3.jpg"
//             className="absolute top-30 w-90  right-5 rounded-xl shadow-md"
//           />

//           {/* Central Product Card */}
//           <div className="relative bg-white p-6 rounded-2xl shadow-xl w-[380px] z-10">
//             <img src="./images/slider.jpg" className="rounded-lg w-full mb-4" />

//             {/* Dummy details */}
//             <div className="space-y-3">
//               <div className="h-3 bg-gray-200 rounded w-3/4"></div>
//               <div className="h-3 bg-gray-200 rounded w-2/3"></div>
//               <div className="h-3 bg-gray-200 rounded w-1/2"></div>

//               {/* Colors */}
//               <div className="flex gap-3 mt-4">
//                 <div className="w-6 h-6 bg-green-400 rounded-full"></div>
//                 <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
//                 <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
//               </div>

//               {/* Button */}
//               <button className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 w-full cursor-pointer">
//                 Save Design
//               </button>
//             </div>
//           </div>

//           {/* Tools Sidebar */}
//           <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
//             <button className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center border">
//               ✏️
//             </button>

//             <button className="w-12 h-12 bg-green-500 text-white shadow-lg rounded-lg flex items-center justify-center">
//               🎨
//             </button>

//             <button className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center border">
//               T
//             </button>

//             <button className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center border">
//               🖼️
//             </button>
//           </div>
//         </div>
