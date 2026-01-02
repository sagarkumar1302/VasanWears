import {
  RiTShirt2Line,
  RiStarSmileLine,
  RiSecurePaymentLine,
  RiRulerLine,
  RiGlobalLine,
  RiInfinityLine,
} from "@remixicon/react";

const features = [
  {
    title: "Premium Quality Apparel",
    desc: "We use comfortable, durable fabrics and high-quality printing to ensure every piece looks great and feels even better.",
    icon: RiTShirt2Line,
  },
  {
    title: "Creator-First Platform",
    desc: "Those credits can be used to get your next T-shirt absolutely free.",
    icon: RiStarSmileLine,
  },
  {
    title: "Secure Payments",
    desc: "All payments are processed through trusted and secure gateways, so your transactions are always safe and protected.",
    icon: RiSecurePaymentLine,
  },
  {
    title: "Custom Fit & Style",
    desc: "Choose your size, style, and placement freely to design apparel that truly matches your personality.",
    icon: RiRulerLine,
  },
  {
    title: "Reliable Delivery",
    desc: "We work with trusted fulfilment partners to ensure your custom apparel is printed carefully and delivered reliably.",
    icon: RiGlobalLine,
  },
  {
    title: "No Minimum Orders",
    desc: "Order just one piece or many — there’s no minimum quantity, so creativity is never restricted.",
    icon: RiInfinityLine,
  },
];


const Features = () => {
  return (
    <section className="bg-primary3/50 py-5 md:py-14">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-6 md:mb-12">
          What Makes Us Different?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-8 gap-4">
          {features.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                className="
                  group relative text-center p-8 rounded-2xl
                  bg-white shadow-sm
                  transition-all duration-300
                  hover:bg-primary5 hover:shadow-xl hover:-translate-y-3
                "
              >
                {/* ICON */}
                <div
                  className="
                    w-16 h-16 mx-auto rounded-full
                    border-2 border-primary
                    flex items-center justify-center
                    mb-6
                    transition-all duration-300
                    group-hover:border-white
                  "
                >
                  <Icon className="w-8 h-8 text-primary group-hover:text-white transition" />
                </div>

                {/* TITLE */}
                <h4 className="text-lg font-semibold mb-3 group-hover:text-white transition">
                  {item.title}
                </h4>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 group-hover:text-white transition leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
