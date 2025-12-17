import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section
      className="md:py-40 py-20 bg-cover bg-center text-primary3 text-center bg-fixed relative"
      style={{ backgroundImage: "url(/images/slider3.jpg)" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary2/30 "></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-50">
        <h2 className="text-3xl md:text-4xl font-bold">
          Bring your ideas to life in minutes
        </h2>
        <p className="mt-3 mb-8">
          Print shirts for yourself or your business
        </p>

        <Link
          to="/design"
          className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
          transition-all duration-300 btn-slide md:text-base text-sm inline-block"
        >
          Get Started Today
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
