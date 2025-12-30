import React from "react";
import Banner from "../components/Common/Banner";

const PrivacyPolicy = () => {
  return (
    <div className="md:mt-35 mt-30">
      {/* Page Banner */}
      <Banner pageTitle="Privacy Policy" />

      <div className="container mx-auto px-5 py-10 md:py-20">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-12 space-y-10">

          {/* LAST UPDATED */}
          <p className="text-sm text-primary5">
            <span className="font-medium">Last updated:</span> December 30, 2025
          </p>

          {/* INTRO */}
          <p className="text-primary6 leading-relaxed">
            This Privacy Policy describes Our policies and procedures on the
            collection, use and disclosure of Your information when You use the
            Service and explains Your privacy rights and how the law protects
            You. By using the Service, You agree to the collection and use of
            information in accordance with this Privacy Policy.
          </p>

          {/* INTERPRETATION */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Interpretation and Definitions
            </h2>

            <h3 className="font-medium mb-2">Interpretation</h3>
            <p className="text-primary6">
              Words with capitalized initial letters have meanings defined under
              the following conditions and shall have the same meaning whether
              they appear in singular or plural.
            </p>

            <h3 className="font-medium mt-4 mb-2">Definitions</h3>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li><strong>Account:</strong> A unique account created to access our Service.</li>
              <li><strong>Affiliate:</strong> An entity under common control.</li>
              <li><strong>Company:</strong> VasanWears.</li>
              <li><strong>Cookies:</strong> Small files stored on your device.</li>
              <li><strong>Country:</strong> Bihar, India.</li>
              <li><strong>Device:</strong> Any device accessing the Service.</li>
              <li><strong>Personal Data:</strong> Information identifying an individual.</li>
              <li><strong>Service:</strong> The Website.</li>
              <li><strong>Service Provider:</strong> Third parties processing data.</li>
              <li><strong>Usage Data:</strong> Data collected automatically.</li>
              <li><strong>Website:</strong> https://www.vasanwears.in</li>
              <li><strong>You:</strong> The individual using the Service.</li>
            </ul>
          </section>

          {/* DATA COLLECTION */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Collecting and Using Your Personal Data
            </h2>

            <h3 className="font-medium mb-2">Types of Data Collected</h3>

            <p className="font-medium mt-3">Personal Data</p>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number</li>
              <li>Address, State, ZIP code, City</li>
            </ul>

            <p className="font-medium mt-4">Usage Data</p>
            <p className="text-primary6">
              Usage Data is collected automatically and may include IP address,
              browser type, pages visited, and time spent on pages.
            </p>
          </section>

          {/* COOKIES */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Tracking Technologies & Cookies
            </h2>
            <p className="text-primary6">
              We use Cookies, web beacons, tags, and scripts to track activity
              and improve the Service. Cookies may be Session or Persistent.
            </p>

            <ul className="list-disc pl-6 text-primary6 space-y-2 mt-3">
              <li><strong>Essential Cookies:</strong> Required for site functionality.</li>
              <li><strong>Acceptance Cookies:</strong> Store cookie consent.</li>
              <li><strong>Functionality Cookies:</strong> Remember preferences.</li>
            </ul>
          </section>

          {/* USE OF DATA */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Use of Your Personal Data
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Manage your account</li>
              <li>Process orders and payments</li>
              <li>Send service-related communications</li>
              <li>Improve services and marketing</li>
            </ul>
          </section>

          {/* THIRD PARTIES */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Third-Party Services
            </h2>
            <ul className="list-disc pl-6 text-primary6 space-y-2">
              <li>Payments: Razorpay</li>
              <li>Email: Resend</li>
              <li>Advertising & Social Media Platforms</li>
            </ul>
          </section>

          {/* DATA RIGHTS */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Your Data Protection Rights
            </h2>
            <p className="text-primary6">
              Depending on your location, you may have rights under GDPR,
              CCPA/CPRA, or other data protection laws, including access,
              correction, deletion, and portability of your data.
            </p>
          </section>

          {/* SECURITY */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Security of Your Personal Data
            </h2>
            <p className="text-primary6">
              We use commercially reasonable measures to protect your data, but
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* CHILDREN */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Children’s Privacy
            </h2>
            <p className="text-primary6">
              Our Service does not address anyone under the age of 13, and we do
              not knowingly collect data from children.
            </p>
          </section>

          {/* CHANGES */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Changes to This Privacy Policy
            </h2>
            <p className="text-primary6">
              We may update this Privacy Policy periodically. Changes are
              effective once posted on this page.
            </p>
          </section>

          {/* CONTACT */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Contact Us
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

export default PrivacyPolicy;
