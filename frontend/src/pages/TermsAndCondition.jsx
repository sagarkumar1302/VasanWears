import React from "react";
import Banner from "../components/Common/Banner";

const TermsAndCondition = () => {
  return (
    <div className="md:mt-35 mt-30">
      {/* Page Banner */}
      <Banner pageTitle="Terms & Conditions" />

      <div className="container mx-auto px-5 py-10 md:py-20">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-12 space-y-10">

          {/* LAST UPDATED */}
          <p className="text-sm text-primary5">
            <span className="font-medium">Last updated:</span> December 30, 2025
          </p>

          {/* INTRO */}
          <p className="text-primary6 leading-relaxed">
            Welcome to <span className="font-medium">VasanWears</span>. These
            Terms & Conditions (“Terms”) govern your access to and use of our
            website{" "}
            <a
              href="https://www.vasanwears.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary1 underline"
            >
              https://www.vasanwears.in
            </a>{" "}
            and our services. By accessing or using our website, placing an
            order, or uploading any design, you agree to be bound by these
            Terms. If you do not agree, please do not use our Service.
          </p>

          {/* SECTION */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. About VasanWears
            </h2>
            <p className="text-primary6 leading-relaxed">
              VasanWears is an Indian startup offering customized
              print-on-demand apparel, including but not limited to T-shirts
              and related products. All products are made-to-order based on
              customer-submitted designs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Eligibility to Use the Service
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>You must be at least 18 years old to place an order.</li>
              <li>
                You confirm that you have the legal capacity to enter into a
                binding contract under Indian law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Creating an account is optional but may be required.</li>
              <li>
                You are responsible for maintaining confidentiality of your
                account credentials.
              </li>
              <li>You agree to provide accurate and up-to-date information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Custom Designs & User Content
            </h2>

            <h3 className="font-medium mt-4 mb-2">
              4.1 Ownership & Responsibility
            </h3>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>You own the rights or have permission to use the content.</li>
              <li>The content does not violate IP or trademark laws.</li>
              <li>
                The content does not contain illegal or offensive material.
              </li>
            </ul>

            <p className="text-primary6 mt-3">
              VasanWears acts only as a printing service provider and does not
              verify ownership of uploaded designs.
            </p>

            <h3 className="font-medium mt-6 mb-2">4.2 Prohibited Content</h3>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Copyrighted material without permission</li>
              <li>Unauthorized brand logos or trademarks</li>
              <li>Hate speech, abusive, or illegal content</li>
              <li>Content violating Indian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Order Process</h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Orders are processed after successful payment.</li>
              <li>All products are custom-made.</li>
              <li>
                Design previews are for reference; minor variations may occur.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Pricing & Payments
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>All prices are in INR unless stated otherwise.</li>
              <li>Payments are processed securely via Razorpay.</li>
              <li>We do not store card or UPI details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Cancellations & Refunds
            </h2>

            <p className="text-primary6 font-medium mt-2">
              7.1 Custom Products
            </p>
            <p className="text-primary6">
              No cancellations or refunds once production has started.
            </p>

            <p className="text-primary6 font-medium mt-4">
              7.2 Defective or Incorrect Orders
            </p>
            <p className="text-primary6">
              Issues must be reported within 24 hours of delivery with photos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Shipping & Delivery
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Delivery timelines are estimates.</li>
              <li>We are not responsible for courier delays.</li>
              <li>Shipping charges are shown at checkout.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Governing Law & Jurisdiction
            </h2>
            <p className="text-primary6">
              These Terms are governed by the laws of India. Disputes shall be
              subject to courts in Bihar, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Contact Information
            </h2>
            <p className="text-primary6">
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
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;
