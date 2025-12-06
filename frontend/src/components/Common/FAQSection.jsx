import React, { useState } from "react";
import { RiAddLine, RiSubtractLine } from "@remixicon/react";

const faqs = [
  {
    q: "How does custom t-shirt printing work?",
    a: "Simply choose a design, customize it using our online editor, and place your order. We print and deliver it to your doorstep.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 4–7 business days depending on your location. Express options are available.",
  },
  {
    q: "Can I upload my own design?",
    a: "Yes! You can upload PNG, JPG, and SVG files. Our editor also lets you add text, shapes, and clipart.",
  },
  {
    q: "Is there a minimum order quantity?",
    a: "No! You can order a single custom t-shirt or as many as you want.",
  },
  {
    q: "Which printing methods do you use?",
    a: "We use DTG (Direct-to-Garment) and screen printing depending on the design and quantity.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="w-full py-8 px-4 md:py-20 bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('/images/slider2.jpg')] bg-cover bg-center bg-fixed">
      <div className="container mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 text-primary3">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-primary3 mb-5 md:mb-12">
          Everything you need to know about our custom t-shirt printing service.
        </p>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border-b border-primary4/80 pb-4 cursor-pointer"
              onClick={() => toggleFAQ(i)}
            >
              <div className="flex justify-between items-center">
                <h5 className="text-lg md:text-2xl  font-medium text-primary3">{item.q}</h5>

                {openIndex === i ? (
                  <RiSubtractLine size={22} className="text-primary3" />
                ) : (
                  <RiAddLine size={22} className="text-primary3" />
                )}
              </div>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "mt-3 max-h-40" : "max-h-0"
                }`}
              >
                <p className="text-primary3 leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
