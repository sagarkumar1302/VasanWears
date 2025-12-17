import React from "react";
import Banner from "../components/Common/Banner";
import Features from "../components/Common/Features";
import CTASection from "../components/Common/CTASection";
import Counters from "../components/Common/Counters";
import Team from "../components/Common/Team";
import ZigZag2 from "../components/Common/ZigZag2";
import ZigZag from "../components/Common/ZigZag";
import ZigZag3 from "../components/Common/ZigZag3";


const AboutPage = () => {
  return (
    <div className="pt-10 md:py-10">
      <Banner pageTitle="About" />

      <ZigZag />
      <ZigZag2/>
      <ZigZag3/>
      <Features />
      <CTASection />
      <Counters />
      {/* <ContactBlock /> */}
    </div>
  );
};

export default AboutPage;
