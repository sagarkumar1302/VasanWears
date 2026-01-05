import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
import { emailTemplate } from "../template/defaultTempalte.js";
const sendEmail = async ({ email, subject, message, url, title, buttonText }) => {
  const response = await resend.emails.send({
    from: `VasanWears <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: emailTemplate({ title, message, buttonText, buttonLink: url })
  });
};

export default sendEmail;
