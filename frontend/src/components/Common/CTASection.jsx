const CTASection = () => {
  return (
    <section
      className="py-20 bg-cover bg-center text-white text-center"
      style={{ backgroundImage: "url(/images/slider3.jpg)" }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold">
        Bring your ideas to life in minutes
      </h2>
      <p className="mt-3">Print shirts for yourself or your business</p>
      <button className="mt-6 px-6 py-3 bg-primary rounded-md">
        Get Started Today
      </button>
      </div>
    </section>
  );
};

export default CTASection;
