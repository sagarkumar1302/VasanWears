import {
  RiMoneyDollarCircleLine,
  RiShoppingBag3Line,
  RiUserStarLine,
  RiBarChart2Line,
  RiFlashlightLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { useCountUpOnView } from "../../utils/useCountUpOnView";
import { Link } from "react-router-dom";

const stats = [
  {
    label: "Invested in printing equipment",
    value: 48,
    suffix: "M",
    icon: RiMoneyDollarCircleLine,
  },
  {
    label: "Orders processed monthly",
    value: 1400,
    suffix: "",
    icon: RiShoppingBag3Line,
  },
  {
    label: "Sold by customers through TeeSpace",
    value: 64,
    suffix: "M+",
    icon: RiUserStarLine,
  },
  {
    label: "Revenue generated worldwide",
    value: 26,
    suffix: "M+",
    icon: RiBarChart2Line,
  },
];

const Counters = () => {
  return (
    <section className="md:py-14 pt-5 pb-8 bg-white">
      <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-12 items-center">
        {/* LEFT - STATS */}
        <div className="w-full lg:w-1/2 flex md:flex-row  flex-col gap-6">
          {/* ROW 1 */}
          <div className="flex flex-col gap-6 md:mt-20">
            {[stats[0], stats[1]].map((s, i) => {
              const { ref, count } = useCountUpOnView(s.value);
              const Icon = s.icon;

              return (
                <div
                  key={i}
                  ref={ref}
                  className="group bg-white rounded-2xl p-6 shadow-md 
                  hover:shadow-xl transition-all duration-300 
                  hover:-translate-y-1 border border-primary5/50"
                >
                  <Icon
                    size={36}
                    className="text-primary5 mb-4 group-hover:scale-110 transition-transform"
                  />

                  <h3 className="text-3xl font-bold text-primary">
                    ${count}
                    {s.suffix}
                  </h3>

                  <p className="text-primary5 mt-2 text-sm leading-relaxed">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ROW 2 */}
          <div className="flex flex-col gap-6">
            {[stats[2], stats[3]].map((s, i) => {
              const { ref, count } = useCountUpOnView(s.value);
              const Icon = s.icon;

              return (
                <div
                  key={i}
                  ref={ref}
                  className="group bg-white rounded-2xl p-6 shadow-md 
                  hover:shadow-xl transition-all duration-300 
                  hover:-translate-y-1 border border-primary5/50"
                >
                  <Icon
                    size={36}
                    className="text-primary5 mb-4 group-hover:scale-110 transition-transform"
                  />

                  <h3 className="text-3xl font-bold text-primary">
                    ${count}
                    {s.suffix}
                  </h3>

                  <p className="text-primary5 mt-2 text-sm leading-relaxed">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT - CONTENT */}
        <div className="w-full lg:w-1/2">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3">
            <RiFlashlightLine />
            <span className="uppercase tracking-wide text-sm">
              VasanWears in Numbers
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Custom Apparel for Creators & Businesses
          </h2>

          <p className="text-gray-600 leading-relaxed mb-8 max-w-lg">
            Whether you’re creating for yourself or building a brand, VasanWears
            transforms creativity into wearable identity. Design freely, preview
            instantly, and trust us to print and deliver with care.
          </p>

          <Link to="/shop"
            className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
   transition-all duration-300 btn-slide md:text-base text-sm"
          >
            Start Designing
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Counters;
