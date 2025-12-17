const ZigZag3 = () => {
  return (
    <section className="px-4 container mx-auto py-5 md:py-14 ">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <span className="text-primary font-semibold uppercase text-sm">
            Who we are
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Create stunning print for your business
          </h2>
          <p className="text-gray-600 mt-4">
            We provide premium print-on-demand services with modern technology
            and unlimited customization options.
          </p>

          <ul className="mt-6 space-y-2 text-gray-700">
            <li>✔ Premium quality printing</li>
            <li>✔ Custom colors & designs</li>
            <li>✔ Fast & secure delivery</li>
          </ul>
        </div>

        <img src="/images/VasanNS.png" alt="" className="rounded-xl w-full order-1 md:order-2" />
      </div>
      
    </section>
  );
};

export default ZigZag3;
