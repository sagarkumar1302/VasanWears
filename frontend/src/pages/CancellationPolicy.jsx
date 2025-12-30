import React from "react";
import Banner from "../components/Common/Banner";

const CancellationPolicy = () => {
  return (
    <div className="md:mt-35 mt-30">
      {/* Page Banner */}
      <Banner pageTitle="Cancellation & Refund Policy" />

      <div className="container mx-auto px-5 py-10 md:py-20">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-12 space-y-10">

          {/* LAST UPDATED */}
          <p className="text-sm text-primary5">
            <span className="font-medium">Last updated:</span> December 30, 2025
          </p>

          {/* INTRO */}
          <p className="text-primary6 leading-relaxed">
            Thank you for shopping with <span className="font-medium">VasanWears</span>.
            Please read this policy carefully before placing an order.
            VasanWears offers customized, made-to-order products. Order
            fulfilment, printing, shipping, delivery, and return processing are
            managed through our authorized third-party fulfilment partners.
          </p>

          {/* SECTION 1 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Order Cancellation</h2>

            <h3 className="font-medium mt-3 mb-2">
              1.1 Cancellation Before Production
            </h3>
            <p className="text-primary6">
              Orders may be cancelled only before production begins. Once an
              order has been confirmed and sent for printing, it cannot be
              cancelled, as the product is customized specifically for you.
            </p>

            <h3 className="font-medium mt-4 mb-2">
              1.2 Cancellation After Production
            </h3>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Orders cannot be cancelled</li>
              <li>Payments are non-refundable</li>
            </ul>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Refunds</h2>
            <p className="text-primary6">
              Refunds are not applicable for change of mind, incorrect size
              selection, or design approval errors made by the customer, as all
              products are custom printed.
            </p>

            <p className="text-primary6 mt-3 font-medium">
              Refunds or replacements may be considered only in the following cases:
            </p>
            <ul className="list-disc pl-6 text-primary6 space-y-2 mt-2">
              <li>The product received is damaged</li>
              <li>The product has a manufacturing or printing defect</li>
              <li>The wrong product was delivered</li>
            </ul>

            <p className="text-primary6 mt-3">
              Issues must be reported within <strong>24 hours of delivery</strong>,
              along with clear photos or videos showing the issue.
            </p>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Returns & Replacement Process
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>
                All return, replacement, and quality verification processes are
                handled by our fulfilment partners.
              </li>
              <li>
                Approval is subject to verification of the reported issue.
              </li>
              <li>
                Products must be unused, unwashed, and in original condition
                unless damaged upon delivery.
              </li>
            </ul>

            <p className="text-primary6 mt-3">
              VasanWears reserves the right to approve or reject any return or
              replacement request after review.
            </p>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Refund Processing Time
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Refunds will be processed to the original payment method</li>
              <li>Processing may take 7–10 business days</li>
              <li>
                Additional 1–2 business days may be required for banking or
                gateway processing
              </li>
            </ul>

            <p className="text-primary6 mt-3">
              Refund timelines may vary depending on your bank or payment provider.
            </p>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Non-Refundable Scenarios
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Incorrect size selected by the customer</li>
              <li>Minor color or orientation variations</li>
              <li>Customer-approved designs with spelling or layout errors</li>
              <li>Delays caused by courier partners or external factors</li>
              <li>Failed delivery due to incorrect address provided</li>
            </ul>
          </section>

          {/* SECTION 6 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Shipping Delays
            </h2>
            <p className="text-primary6">
              Delivery timelines are estimates and may be affected by courier
              delays, weather conditions, or regional disruptions. Shipping
              delays alone do not qualify for refunds.
            </p>
          </section>

          {/* SECTION 7 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Contact for Support
            </h2>
            <p className="text-primary6">
              For cancellation or refund-related queries, please contact us:
            </p>
            <p className="text-primary6 mt-2">
              Email:{" "}
              <a
                href="mailto:info@vasanwears.in"
                className="text-primary5 underline"
              >
                info@vasanwears.in
              </a>
            </p>
            <p className="text-primary6">
              Contact Page:{" "}
              <a
                href="https://www.vasanwears.in/contact-us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary5 underline"
              >
                https://www.vasanwears.in/contact-us
              </a>
            </p>

            <p className="text-primary6 mt-3">
              Please include your <strong>Order ID</strong>, registered email or
              phone number, and photos/videos (if applicable).
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
