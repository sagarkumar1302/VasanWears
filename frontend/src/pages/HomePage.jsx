import React from "react";
import HeroSlider from "../components/Common/HeroSlider";
import HowItWorks from "../components/Common/HowItWorks";
import HeroShowcase from "../components/Common/HeroShowcase";
import ProductShowcase from "../components/Common/ProductShowcase";
import ZigZagFeatures from "../components/Common/ZigZagFeatures";
import ShoppingCategories from "../components/Common/ShoppingCategories";
import FAQSection from "../components/Common/FAQSection";
import WelcomeOfferModal from "../components/Common/WelcomeOfferModal";

const HomePage = () => {
  return (
    <>
      <WelcomeOfferModal />
      <HeroSlider />
      <ShoppingCategories/>
      <HowItWorks />
      <HeroShowcase />
      <ProductShowcase/>
      <ZigZagFeatures/>
      <FAQSection/>
    </>
  );
};

export default HomePage;
