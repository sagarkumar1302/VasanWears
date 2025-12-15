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
    title: "Premium quality shirts",
    desc: "Lorem ipsum det, consec tetur duis nec fringi det, consec",
    icon: RiTShirt2Line,
  },
  {
    title: "Outstanding quality",
    desc: "Lorem ipsum det, consec tetur duis nec fringi det, consec",
    icon: RiStarSmileLine,
  },
  {
    title: "Secure payment",
    desc: "Lorem ipsum det, consec tetur duis nec fringi det, consec",
    icon: RiSecurePaymentLine,
  },
  {
    title: "Custom size & style",
    desc: "Lorem ipsum det, consec tetur duis nec fringi det, consec",
    icon: RiRulerLine,
  },
  {
    title: "Worldwide shipping",
    desc: "Lorem ipsum det, consec tetur duis nec fringi det, consec",
    icon: RiGlobalLine,
  },
  {
    title: "No order minimums",
    desc: "Lorem ipsum det, consec tetur duis nec fringi det, consec",
    icon: RiInfinityLine,
  },
];

const Features = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-12">
          What Makes Us Different?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
