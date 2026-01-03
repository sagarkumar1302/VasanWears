import React from "react";
import Banner from "../components/Common/Banner";

const TermsAndCondition = () => {
  return (
    <div className="md:mt-35 mt-30 bg-gray-50">
      {/* Page Banner */}
      <Banner pageTitle="Terms & Conditions" />

      <div className="container mx-auto px-5 py-10 md:py-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-12 max-w-5xl mx-auto text-gray-700 leading-relaxed">
          
          {/* LAST UPDATED */}
          <p className="text-sm text-primary5 mb-6">
            <span className="font-bold uppercase tracking-wide">Last updated:</span> January 1, 2026
          </p>

          <div className="space-y-8">
            {/* INTRO */}
            <section className="border-b border-gray-100 pb-6">
              <p className="mb-4 text-lg">
                Welcome to <strong>VasanWears</strong>. These Terms & Conditions (“Terms”) govern your access to and use 
                of our website <a href="https://www.vasanwears.in" className="text-primary5 hover:underline font-medium">https://www.vasanwears.in</a> and our services.
              </p>
              <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 text-blue-900">
                By accessing or using our website, placing an order, or uploading any design, you agree to be 
                bound by these Terms. If you do not agree, please do not use our Service.
              </p>
            </section>

            {/* 1. About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. About VasanWears</h2>
              <p>VasanWears is an Indian startup offering customized print-on-demand apparel, including but 
              not limited to T-shirts and related products.</p>
              <p>All products are made-to-order based on customer-submitted designs.</p>
            </section>

            {/* 2. Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Eligibility to Use the Service</h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>You must be at least 18 years old to place an order.</li>
                <li>By using the Service, you confirm that you have the legal capacity to enter into a binding 
                contract under Indian law.</li>
              </ul>
            </section>

            {/* 3. Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. User Accounts</h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>Creating an account is optional but may be required for certain features.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide accurate and up-to-date information.</li>
              </ul>
            </section>

            {/* 4. Custom Designs */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Custom Designs & User Content</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 Ownership & Responsibility</h3>
                  <p className="mb-4 text-sm italic">When you upload any image, logo, artwork, or text (“User Content”), you confirm that:</p>
                  <ul className="list-disc pl-8 space-y-2">
                    <li>You own the rights to the content or have legal permission to use it.</li>
                    <li>The content does not violate copyright, trademark, or intellectual property laws.</li>
                    <li>The content does not contain illegal, offensive, or restricted material.</li>
                  </ul>
                  <p className="mt-4 font-semibold text-primary5">VasanWears acts only as a printing service provider and does not verify ownership of uploaded designs.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 Prohibited Content</h3>
                  <p className="mb-2">You may not upload content that includes:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {[
                        "Copyrighted material without permission",
                        "Brand logos or trademarks without authorization",
                        "Hate speech, explicit, abusive, or illegal content",
                        "Content violating Indian law or third-party rights"
                    ].map((item, i) => (
                        <li key={i} className="bg-red-50 text-red-800 p-3 rounded border border-red-100 text-sm">
                            • {item}
                        </li>
                    ))}
                  </ul>
                  <p>We reserve the right to reject or cancel orders containing such content.</p>
                </div>
              </div>
            </section>

            {/* 5. Order Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Order Process</h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>Orders are processed only after successful payment.</li>
                <li>Since each product is custom-made, production begins 12–24 hours after confirmation. You can cancel your order within 24 hours.</li>
                <li>Design previews shown on the website are for reference only; minor color or size variations may occur.</li>
              </ul>
            </section>

            {/* 6. Pricing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Pricing & Payments</h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>All prices are listed in Indian Rupees (INR) unless stated otherwise.</li>
                <li>Payments are processed securely via <strong>Razorpay</strong>.</li>
                <li>We do not store payment card, UPI, or banking details.</li>
                <li>Prices may change without prior notice, but confirmed orders will not be affected.</li>
              </ul>
            </section>

            {/* 7. Cancellations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. Cancellations & Refunds</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1 Custom Products</h3>
                  <p className="font-medium">Since products are custom-printed, cancellations or refunds are not allowed once production has started.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">7.2 Defective or Incorrect Orders</h3>
                  <p className="mb-2 text-sm italic underline decoration-primary5">Refunds or replacements may be issued only if:</p>
                  <ul className="list-disc pl-8 space-y-1">
                    <li>The product is defective</li>
                    <li>The wrong item was delivered</li>
                    <li>There is a printing error caused by us</li>
                  </ul>
                  <p className="mt-4 p-3 bg-gray-100 rounded text-sm">Any issue must be reported within 24 hours of delivery, along with clear photos.</p>
                </div>
              </div>
            </section>

            {/* 8. Shipping */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. Shipping & Delivery</h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>Delivery timelines are estimates and may vary based on location and logistics.</li>
                <li>VasanWears is not responsible for delays caused by courier partners, weather, or unforeseen circumstances.</li>
                <li>Shipping charges, if applicable, are displayed at checkout.</li>
              </ul>
            </section>

            {/* 9. IP */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Intellectual Property</h2>
              <ul className="list-disc pl-8 space-y-2">
                <li>All website content, including logos, text, graphics, and software, belongs to VasanWears.</li>
                <li>You may not copy, reproduce, or distribute website content without permission.</li>
              </ul>
            </section>

            {/* 10. Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. Limitation of Liability</h2>
              <p className="mb-2 italic">To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>VasanWears shall not be liable for indirect, incidental, or consequential damages.</li>
                <li>Our liability shall not exceed the amount paid for the specific order.</li>
              </ul>
            </section>

            {/* 11. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">11. Termination</h2>
              <p className="mb-2">We reserve the right to suspend or terminate access to the Service if:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>These Terms are violated</li>
                <li>Fraudulent or illegal activity is suspected</li>
              </ul>
            </section>

            {/* 12. 3rd Party */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">12. Third-Party Services</h2>
              <p className="mb-4">We use third-party services including:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <li className="p-4 border rounded-lg text-center font-medium">Razorpay (payments)</li>
                  <li className="p-4 border rounded-lg text-center font-medium">Resend (email)</li>
                  <li className="p-4 border rounded-lg text-center font-medium">Social Media (marketing)</li>
              </ul>
              <p>We are not responsible for the practices of these third parties.</p>
            </section>

            {/* 13. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">13. Governing Law & Jurisdiction</h2>
              <p className="mb-2">These Terms are governed by the laws of India.</p>
              <p className="p-4 bg-gray-900 text-white rounded-lg">
                Any disputes shall be subject to the exclusive jurisdiction of courts in <strong>Bihar, India</strong>.
              </p>
            </section>

            {/* 14. Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">14. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. Changes will be posted on this page with an updated date.</p>
            </section>

            {/* 15. Contact */}
            <section className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 underline decoration-primary5 underline-offset-8">15. Contact Information</h2>
              <p className="mb-6 text-gray-600">For any questions regarding these Terms, you can contact us:</p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a href="mailto:info@vasanwears.in" className="px-6 py-3 bg-primary5 text-white rounded-lg font-medium hover:bg-primary5/90 transition-colors">
                  Email: info@vasanwears.in
                </a>
                <a href="https://www.vasanwears.in/contact-us" target="_blank" rel="noreferrer" className="px-6 py-3 border border-primary5 text-primary5 rounded-lg font-medium hover:bg-primary5/5 transition-colors">
                  Contact Us Page
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;