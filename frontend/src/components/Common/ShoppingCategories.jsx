import React, { useEffect, useRef, useState, memo } from "react";
import { Link } from "react-router-dom";
import { getAllSubCategoriesApi } from "../../utils/subCategoryApi.js";
import Loader from "./Loader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ShoppingCategories = memo(() => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryContainer = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllSubCategoriesApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Fetch categories error", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ GSAP ANIMATION - OPTIMIZED
  useGSAP(
    () => {
      if (!categoryContainer.current || categories.length === 0) return;

      const ctx = gsap.context(() => {
        // Heading animation
        gsap.from(".cat-heading", {
          y: 40,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
        });

        // Category cards animation
        gsap.from(".cat-item", {
          y: 50,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      }, categoryContainer);

      return () => ctx.revert();
    },
    { dependencies: [loading], scope: categoryContainer } // optimized with scope
  );

  if (loading) {
    return <Loader />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-5 md:py-16 bg-white px-4">
      <div ref={categoryContainer} className="container mx-auto text-center">
        <h2 className="cat-heading text-3xl md:text-5xl font-bold mb-8 md:mb-12">
          Shopping by Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 md:mt-15">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?subCategory=${cat._id}`}
              className="cat-item flex flex-col items-center cursor-pointer"
            >
              <div className="rounded-full overflow-hidden bg-gray-100 shadow-sm hover:scale-105 transition-all duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="mt-4 md:text-2xl text-lg font-semibold">
                {cat.name}
              </p>

              {cat.count && (
                <span className="text-primary5 text-sm">{cat.count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});

export default ShoppingCategories;
