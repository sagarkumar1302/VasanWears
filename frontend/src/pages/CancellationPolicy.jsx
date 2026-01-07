import React from "react";
import Banner from "../components/Common/Banner";

const CancellationPolicy = () => {
  return (
    <div className="md:mt-35 mt-30 bg-gray-50">
      {/* Page Banner */}
      <Banner pageTitle="Cancellation & Refund Policy" />

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
                Thank you for shopping with <strong>VasanWears</strong>. 
                Please read this policy carefully before placing an order.
              </p>
              <p className="p-4 bg-primary5/5 border-l-4 border-primary5 rounded-r-lg">
                VasanWears offers customized, made-to-order products. Order fulfilment, printing, shipping, 
                delivery, and return processing are managed through our authorized third-party fulfilment 
                partners.
              </p>
            </section>

            {/* 1. Order Cancellation */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Order Cancellation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1.1 Cancellation Before Production</h3>
                  <p>Orders may be cancelled only before production begins.</p>
                  <p className="mt-2 font-medium text-gray-900">Once an order has been confirmed and sent for printing, it cannot be cancelled, as the product is customized specifically for you.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1.2 Cancellation After Production</h3>
                  <p className="mb-2">After production has started:</p>
                  <ul className="list-disc pl-8 space-y-1 font-semibold text-red-600">
                    <li>Orders cannot be cancelled</li>
                    <li>Payments are non-refundable</li>
                  </ul>
                  <p className="mt-2">This applies to all customized products.</p>
                </div>
              </div>
            </section>

            {/* 2. Refunds */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Refunds</h2>
              <p className="mb-4">
                Refunds are not applicable for change of mind, incorrect size selection, or design approval 
                errors made by the customer, as all products are custom printed.
              </p>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <p className="font-bold text-green-900 mb-3">Refunds or replacements may be considered only in the following cases:</p>
                <ul className="list-disc pl-8 space-y-2 text-green-800">
                  <li>The product received is damaged</li>
                  <li>The product has a manufacturing or printing defect</li>
                  <li>The wrong product was delivered</li>
                </ul>
                <p className="mt-4 text-sm font-bold text-green-700 uppercase tracking-tight italic">
                  * Such issues must be reported within 24 hours of delivery, along with clear photos or videos showing the issue.
                </p>
              </div>
            </section>

            {/* 3. Returns & Replacement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Returns & Replacement Process</h2>
              <ul className="list-disc pl-8 space-y-3">
                <li>All return, replacement, and quality verification processes are handled by our fulfilment partners as per their operational guidelines.</li>
                <li>Approval of returns or replacements is subject to verification of the issue.</li>
                <li>Products must be unused, unwashed, and in original condition unless damaged upon delivery.</li>
              </ul>
              <p className="mt-4 italic">VasanWears reserves the right to approve or reject any return or replacement request after review.</p>
            </section>

            {/* 4. Processing Time */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Refund Processing Time</h2>
              <p className="mb-4 text-sm italic">If a refund is approved:</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <span className="h-2 w-2 rounded-full bg-primary5" />
                    <span>Refunds will be processed to the original payment method</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <span className="h-2 w-2 rounded-full bg-primary5" />
                    <span>Processing may take <strong>7–10 business days</strong></span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <span className="h-2 w-2 rounded-full bg-primary5" />
                    <span>Please allow an additional 1–2 business days for banking and payment gateway delays</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">Refund timelines may vary depending on your bank or payment provider.</p>
            </section>

            {/* 5. Non-Refundable */}
            <section className="bg-gray-900 text-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6 text-primary5">5. Non-Refundable Scenarios</h2>
              <p className="mb-4 opacity-80 text-sm">Refunds will not be provided in the following cases:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Incorrect size selected by the customer",
                  "Minor color and orientation variations due to screen differences",
                  "Customer-approved designs with spelling or layout errors",
                  "Delays caused by courier partners or external factors",
                  "Failed delivery due to incorrect address provided by the customer"
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-red-400">✕</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 6. Shipping Delays */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Shipping Delays</h2>
              <p className="mb-2">Delivery timelines are estimates and may be affected by:</p>
              <ul className="list-disc pl-8 mb-4 space-y-1">
                <li>Courier partner delays</li>
                <li>Weather conditions</li>
                <li>Regional or operational disruptions</li>
              </ul>
              <p className="font-semibold text-red-600">Shipping delays alone do not qualify for refunds.</p>
            </section>

            {/* 7. Contact Support */}
            <section className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 underline decoration-primary5 underline-offset-8">7. Contact for Support</h2>
              <p className="mb-6">For refund or cancellation related queries, please contact us:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <a href="mailto:info@vasanwears.in" className="px-6 py-4 bg-primary5 text-white rounded-lg font-medium hover:bg-primary5/90 transition-all flex flex-col items-center">
                  <span className="text-xs opacity-80 uppercase mb-1">Send Email</span>
                  info@vasanwears.in
                </a>
                <a href="/contact-us"   className="px-6 py-4 border border-primary5 text-primary5 rounded-lg font-medium hover:bg-primary5/5 transition-all flex flex-col items-center">
                   <span className="text-xs opacity-80 uppercase mb-1">Web Support</span>
                   Visit Contact Page
                </a>
              </div>

              <div className="max-w-md mx-auto text-left bg-white p-5 rounded-lg border text-sm">
                <p className="font-bold mb-2 text-gray-900">Please include:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Order ID</li>
                  <li>• Registered email or phone number</li>
                  <li>• Photos/videos (if reporting an issue)</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;