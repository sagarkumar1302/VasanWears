import React from "react";
import {
  RiTwitterXLine,
  RiFacebookCircleFill,
  RiInstagramFill,
  RiYoutubeFill,
} from "@remixicon/react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/VasanWears.png";
import OfferSection from "./OfferSection";
const Footer = () => {
  return (
    <div>
      <OfferSection/>
      <footer className="w-full bg-primary3/50 px-4">
      {/* TOP SECTION */}
      
      <div className="container mx-auto  pt-10 pb-5 md:py-25 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 md:gap-12 gap-5">
        {/* Brand Info */}
        <div className="space-y-4">
          <Link to="/">
            <img src={logo} alt="Vasan Wears Logo" className="w-[40%] mb-4" />
          </Link>

          <p className="text-primary5">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p className="text-primary5">hello@teespace.io</p>

          <p className="text-primar leading-relaxed">
            3665 Paseo Place, Suite 0960 <br /> San Diego
          </p>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Information</h4>
          <ul className="space-y-3 text-primary5">
            <li><Link to="/about">About</Link></li>
            <li>Our Blog</li>
            <li>Start a Return</li>
            <li>Contact Us</li>
            <li>Shipping FAQ</li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Services</h4>
          <ul className="space-y-3 text-primary5">
            <li>Printing Services</li>
            <li>Digital Scanning</li>
            <li>Design Services</li>
            <li>Copying Services</li>
            <li>Print on Demand</li>
          </ul>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Useful links</h4>
          <ul className="space-y-3 text-primary5">
            <li>My Account</li>
            <li>Print Provider</li>
            <li>Become a Partner</li>
            <li>Custom Products</li>
            <li>Make your own shirt</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
          <p className="text-primary5 mb-4">Subscribe to our newsletter.</p>
          <div className="flex md:flex-col flex-row">
            <input
            type="text"
            className="border border-primary4 px-4 py-2 md:rounded-md bg-white text-primary2 outline-0 rounded-tl-xl rounded-bl-xl"
            placeholder="Enter your email...."
          />
          <button
            to="/shop"
            className="py-2 px-4 rounded-br-xl rounded-tr-xl md:rounded-md font-semibold text-primary2 
                       transition-all duration-300 btn-slide  text-sm cursor-pointer md:mt-4"
          >
            Subscribe
          </button>
          </div>
        </div>
      </div>

      {/* PAYMENT & COPYRIGHT */}
      <div className="border-t border-primary4 px-4 pb-15 md:pb-0">
        <div className="container mx-auto  md:py-6 py-4 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
          {/* Payment Icons */}
          <div className="flex items-center gap-3 flex-wrap text-primary5 ">
            <Link to="/terms-and-condition">Terms & Condition</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>

          {/* Copyright */}
          <p className="text-primary5 text-base">
            © {new Date().getFullYear()} Vasan Wears. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-primary2">
            <Link to="/terms-and-condition" className="hover:text-primary1">
              <RiTwitterXLine size={22} />
            </Link>
            <Link to="/terms-and-condition" className="hover:text-primary1">
              <RiFacebookCircleFill size={22} />
            </Link>
            <Link to="/terms-and-condition" className="hover:text-primary1">
              <RiInstagramFill size={22} />
            </Link>
            <Link to="/terms-and-condition" className="hover:text-primary1">
              <RiYoutubeFill size={22} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
