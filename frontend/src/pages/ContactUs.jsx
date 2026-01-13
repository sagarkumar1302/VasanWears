import React, { useState, useCallback, memo } from "react";
import Banner from "../components/Common/Banner";
import {
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
} from "@remixicon/react";
import { submitContactFormApi } from "../utils/contactApi";
import toast from "react-hot-toast";

const ContactUs = () => {
  const [form, setForm] = useState({
    type: "contact", // contact or feedback
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await submitContactFormApi(form);

      toast.success("Message sent successfully ✅");

      // Clear form
      setForm({
        type: "contact",
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send message"
      );
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <div className="md:mt-35 mt-30">
      <Banner pageTitle="Contact Us" />

      <div className="container mx-auto px-5 py-5 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT INFO */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-primary5 mb-8">
              Have a question about our products, orders, or collaborations?
              Want to share feedback about your experience? We'd love to hear from you.
            </p>

            <div className="space-y-6">
              <ContactItem
                icon={<RiMapPinLine size={22} />}
                title="Our Address"
                text="KP Road, Gaya, 823001"
              />
              {/* <ContactItem
                icon={<RiPhoneLine size={22} />}
                title="Phone"
                text="+91 74639 06412"
              /> */}
              <ContactItem
                icon={<RiMailLine size={22} />}
                title="Email"
                text="info@vasanwears.in"
              />
              {/* <ContactItem
                icon={<RiTimeLine size={22} />}
                title="Working Hours"
                text="Mon – Sat : 10:00 AM – 7:00 PM"
              /> */}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-primary3/50 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-bold mb-6">
              {form.type === "contact" ? "Send Us a Message" : "Share Your Feedback"}
            </h3>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Type Selection */}
              <div>
                <label className="block mb-2 font-medium">
                  I want to:
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="contact"
                      checked={form.type === "contact"}
                      onChange={handleChange}
                      className="w-4 h-4 accent-primary5 cursor-pointer"
                    />
                    <span>Contact You</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="feedback"
                      checked={form.type === "feedback"}
                      onChange={handleChange}
                      className="w-4 h-4 accent-primary5 cursor-pointer"
                    />
                    <span>Give Feedback</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border border-primary4 rounded-lg px-4 py-2 outline-none focus:border-primary5"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border border-primary4 rounded-lg px-4 py-2 outline-none focus:border-primary5"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {form.type === "contact" ? "Subject" : "Feedback Topic"}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder={
                    form.type === "contact"
                      ? "Order / Support / Feedback"
                      : "UI/UX / Product Quality / Delivery / Other"
                  }
                  className="w-full border border-primary4 rounded-lg px-4 py-2 outline-none focus:border-primary5"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {form.type === "contact" ? "Message *" : "Your Feedback *"}
                </label>
                <textarea
                  rows="4"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={
                    form.type === "contact"
                      ? "Write your message..."
                      : "Tell us about your experience with our website..."
                  }
                  className="w-full border border-primary4 rounded-lg px-4 py-2 outline-none focus:border-primary5 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-8 rounded-xl font-semibold text-primary2 
                transition-all duration-300 btn-slide md:text-base text-sm cursor-pointer"
              >
                {loading ? "Sending..." : form.type === "contact" ? "Send Message" : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MAP */}
      <div className="w-full h-[350px] mt-5 md:mt-10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.9582661393147!2d85.00517027592063!3d24.796882547797537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f32a3e1eb36413%3A0xe21b5ed55f7acc31!2sKP%20Rd%2C%20Dulhingunj%2C%20Gaya%2C%20Bihar%20823001!5e0!3m2!1sen!2sin!4v1767177472949!5m2!1sen!2sin"
          width="100%"
          height="350"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

const ContactItem = memo(({ icon, title, text }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary5 text-white">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-primary5">{text}</p>
    </div>
  </div>
));

export default ContactUs;
