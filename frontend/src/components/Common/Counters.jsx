import { useCountUpOnView } from "../../utils/useCountUpOnView";

const stats = [
  { label: "Invested in printing", value: 48 },
  { label: "Orders per month", value: 1400 },
  { label: "Customers served", value: 64000 },
  { label: "Revenue generated", value: 26 },
];

const Counters = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => {
          const { ref, count } = useCountUpOnView(s.value);
          return (
            <div key={i} ref={ref}>
              <h3 className="text-3xl font-bold text-primary">
                {count}+
              </h3>
              <p className="text-gray-600">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Counters;
