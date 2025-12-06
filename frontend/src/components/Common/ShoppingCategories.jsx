import React from "react";

const categories = [
  {
    title: "T-shirt",
    count: 15,
    img: "/images/dummy/dummy1.png",
  },
  {
    title: "Long-sleeves",
    count: 8,
    img: "/images/dummy/dummy1.png",
  },
  {
    title: "Sweater",
    count: 18,
    img: "/images/dummy/dummy1.png",
  },
  {
    title: "Hoodies",
    count: 9,
    img: "/images/dummy/dummy1.png",
  },
  {
    title: "Tanktop",
    count: 6,
    img: "/images/dummy/dummy1.png",
  },
];

const ShoppingCategories = () => {
  return (
    <section className="w-full py-5 md:py-16 bg-white px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12">Shopping by Categories</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 md:mt-15">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col items-center cursor-pointer">
              <div className="rounded-full overflow-hidden bg-gray-100 shadow-sm hover:scale-105 transition-all duration-300 p-5">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="mt-4 md:text-2xl text-lg font-semibold">{cat.title}</p>
              <span className="text-primary5 text-sm">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShoppingCategories;
