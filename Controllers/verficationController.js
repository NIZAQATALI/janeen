import User from '../models/User.js';
import VerificationCode from "../models/Verify.js";
import nodemailer from "nodemailer";
export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  console.log("............",req.body)
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    } 
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await VerificationCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true } 
    );
    // Send email 
    console.log(email,"hhhhhhhhhhhhhhhhhhh")
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    });
    res.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send code" });
  }
};
