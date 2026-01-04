import crypto from "crypto";
import { User } from "../model/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcryptjs from "bcryptjs";
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    const resetUrl = `${process.env.FRONT_END_URL}/reset-password/${resetToken}`;

    const message = `
    You requested a password reset for VasanWears.

    

    This link will expire in 15 minutes.
    </p>
  `;

    await sendEmail({
        email: user.email,
        subject: "VasanWears - Password Reset",
        message,
        url: resetUrl,
        title: "Password Reset Request",
        buttonText: "Reset Password",
    });

    res.json({ message: "Reset link sent to email" });
};
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ SET PLAIN PASSWORD ONLY
    user.password = req.body.password;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // 🔥 pre("save") hashes it once

    res.json({ message: "Password updated successfully" });
};

export { forgotPassword, resetPassword };
