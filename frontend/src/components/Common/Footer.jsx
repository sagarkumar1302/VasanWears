import React, { useState } from "react";
import {
  RiTwitterXLine,
  RiFacebookCircleFill,
  RiInstagramFill,
  RiYoutubeFill,
} from "@remixicon/react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/VasanWears.png";
import OfferSection from "./OfferSection";
import { subscribeNewsletterApi } from "../../utils/subscriberApi";
import toast from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await subscribeNewsletterApi(email);

      toast.success(res.message || "Subscribed successfully 🎉");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <OfferSection />

      <footer className="w-full bg-primary3/50 px-4">
        <div className="container mx-auto pt-10 pb-5 md:py-25 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 md:gap-12 gap-5">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/">
              <img src={logo} alt="Vasan Wears Logo" className="w-[40%] mb-4" />
            </Link>
            <p className="text-primary5">
              Vasan comes from the Sanskrit word “Vastra,” meaning clothing.
              Rooted in our culture and heritage, VasanWears brings this legacy
              into modern fashion.
            </p>
            <p className="text-primary5">info@vasanwears.in</p>
            <p className="text-primary leading-relaxed">
              KP Road, Gaya, 823001 <br /> Gaya,Bihar
            </p>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Information</h4>
            <ul className="space-y-3 text-primary5">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/blogs">Blog</Link>
              </li>
              <li>
                <Link to="/shop">Shop</Link>
              </li>
              <li>
                <Link to="/contact-us">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-primary5">
              <li>
                <Link to="/design">Design Your T-Shirt</Link>
              </li>
              <li>
                <Link to="/terms-and-condition/">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy/">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-and-cancellation/">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/designs-collection/">Designs</Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Useful links</h4>
            <ul className="space-y-3 text-primary5">
              <li>
                <Link to="/my-account">My Account</Link>
              </li>
              <li>
                <Link to="/my-account/order">Orders</Link>
              </li>
              <li>
                <Link to="/my-account/coupons">Coupons</Link>
              </li>
              <li>
                <Link to="/wishlist">My Wishlist</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
            </ul>
          </div>

          {/* ✅ Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-primary5 mb-4">Subscribe to our newsletter.</p>

            <div className="flex md:flex-col flex-row">
              <input
                type="email"
                className="border border-primary4 px-4 py-2 md:rounded-md bg-white text-primary2 outline-0 rounded-tl-xl rounded-bl-xl"
                placeholder="Enter your email...."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className={`py-2 px-4 rounded-br-xl rounded-tr-xl md:rounded-md font-semibold text-primary2 
                  transition-all duration-300 btn-slide text-sm cursor-pointer md:mt-4
                  ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-primary2 mt-5">
              <a
                href="https://youtube.com/@vasanwears"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary1"
              >
                <RiYoutubeFill size={22} />
              </a>
              <a
                href="https://x.com/VasanWears"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary1"
              >
                <RiTwitterXLine size={22} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585672538949"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary1"
              >
                <RiFacebookCircleFill size={22} />
              </a>
              <a
                href="https://www.instagram.com/vasan_wears/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary1"
              >
                <RiInstagramFill size={22} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-primary4 px-4 pb-15 md:pb-0">
          <div className="container mx-auto md:py-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-primary5 text-sm">
              © {new Date().getFullYear()} Vasan Wears. All rights reserved.
            </p>

            <p className="text-primary5 text-sm">
              Designed & Developed by{" "}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary2"
              >
                DevsCove Solutions
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
