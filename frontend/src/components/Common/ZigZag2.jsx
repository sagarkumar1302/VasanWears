const ZigZag2 = () => {
  return (
    <div className="bg-primary3/50">
      <section className="px-4 container mx-auto py-5 md:py-14 ">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <img src="/images/VasanNS.png" alt="" className="rounded-xl w-full" />
          <div>
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
        </div>
      </section>
    </div>
  );
};

export default ZigZag2;
