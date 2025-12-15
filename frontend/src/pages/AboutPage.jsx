import React from "react";
import Banner from "../components/Common/Banner";
import WhoWeAre from "../components/Common/WhoWeAre";
import Features from "../components/Common/Features";
import CTASection from "../components/Common/CTASection";
import Counters from "../components/Common/Counters";
import Team from "../components/Common/Team";


const AboutPage = () => {
  return (
    <div className="pt-10 md:py-10">
      <Banner pageTitle="About" />

      <WhoWeAre />
      <Features />
      <CTASection />
      <Counters />
      <Team />
      {/* <ContactBlock /> */}
    </div>
  );
};

export default AboutPage;
