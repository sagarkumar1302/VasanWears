import { ContactMessage } from "../model/contact.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";

export const submitContactForm = async (req, res) => {
  try {
    const { type, name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json(new ApiResponse(400, "All required fields must be filled"));
    }

    const messageType = type === "feedback" ? "feedback" : "contact";

    // 1️⃣ Save to DB
    const contact = await ContactMessage.create({
      type: messageType,
      name,
      email,
      subject,
      message,
    });

    // 2️⃣ Send email to Admin
    const emailSubject = messageType === "feedback" 
      ? "New Feedback Received - VasanWears" 
      : "New Contact Message - VasanWears";
    
    const emailTitle = messageType === "feedback" 
      ? "New Website Feedback 💬" 
      : "New Contact Inquiry 📩";

    await sendEmail({
      email: process.env.EMAIL_USER, // admin email
      subject: emailSubject,
      title: emailTitle,
      message: `
        <b>Type:</b> ${messageType.toUpperCase()}<br/>
        <b>Name:</b> ${name}<br/>
        <b>Email:</b> ${email}<br/>
        <b>Subject:</b> ${subject || "N/A"}<br/><br/>
        <b>Message:</b><br/>${message}
      `,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Message sent successfully"));

  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error.message));
  }
};
