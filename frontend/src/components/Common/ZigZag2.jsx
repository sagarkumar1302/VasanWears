import React from "react";

const ZigZag2 = () => {
  const brandValues = [
    { title: "Creative Freedom", desc: "Design your apparel your way" },
    { title: "Premium Quality", desc: "Comfortable fabrics and clean prints" },
    { title: "No Minimum Orders", desc: "One piece or many, it’s up to you" },
    { title: "Secure Payments", desc: "Safe and reliable checkout" },
    { title: "Thoughtful Fulfilment", desc: "Printed with care, delivered with trust" },
  ];

  return (
<div className="bg-primary3/10 border-y border-primary3/20">
  <section className="px-4 container mx-auto py-12 md:py-24">
    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
      
      {/* 1. Image Content (Now naturally on the left) */}
      <div className="relative group">
        {/* Decorative Ring */}
        <div className="absolute inset-0 border-2 border-primary5/20 rounded-3xl scale-105 group-hover:scale-110 transition-transform duration-500"></div>

        <img
          src="/images/VasanNS.png"
          alt="VasanWears Vision"
          className="rounded-2xl w-full shadow-2xl relative z-10"
        />
      </div>

      {/* 2. Text Content (Now naturally on the right) */}
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              What We Do
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We offer custom print-on-demand apparel, including T-shirts, hoodies, sweatshirts, and more. 
              Our easy-to-use online designer allows you to upload your own designs, use custom fonts, 
              and preview your creation before ordering — <span className="text-primary5 font-semibold italic">all without needing any design experience.</span>
            </p>
          </div>

          {/* Design Ownership Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary3/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
               <svg className="w-12 h-12 text-primary5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
               </svg>
            </div>
            
            <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
               <span className="w-2 h-6 bg-primary5 rounded-full"></span>
               Complete Design Ownership
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {["No edits without permission", "No copying", "No ownership transfer"].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-primary3/20 p-2 rounded-lg border border-primary3/30">
                  <span className="text-red-500 font-bold">✕</span> {text}
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              If someone buys your design, it stays exactly as you created it. Your work is 
              <span className="text-gray-900 font-semibold"> respected, protected, and credited </span> 
              — because creativity deserves ownership.
            </p>
          </div>
        </div>

        {/* Why VasanWears & Mission Section */}
        <div className="pt-8 border-t border-primary3/30 space-y-8">
          <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Why VasanWears</h3>
          
          <ul className="grid grid-cols-1 gap-5">
            {brandValues.map((item, index) => (
              <li key={index} className="flex items-start gap-4 group">
                <div className="mt-1 bg-primary5 rounded-full p-1 shadow-lg shadow-primary5/20 group-hover:scale-110 transition-transform">
                   <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Final Personalization Text */}
          <div className="bg-primary5/5 p-6 rounded-2xl border border-primary5/10 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              VasanWears turns ideas into something real — something you can wear, share, and be proud of.
              It’s not just about printing on fabric; it’s about expressing who you are.
            </p>
            <div className="flex flex-col gap-1 border-l-2 border-primary5 pl-4">
              <p className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Your ideas.</p>
              <p className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Your identity.</p>
              <p className="text-xl font-black text-primary5 tracking-tighter uppercase italic">Your style.</p>
            </div>
          </div>

          <p className="text-gray-500 italic text-xs text-right">
            Every product is made to order with attention to quality, comfort, and detail.
          </p>
        </div>
      </div>

    </div>
  </section>
</div>
  );
};

export default ZigZag2;