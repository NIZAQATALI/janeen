import User from '../models/User.js';
import VerificationCode from "../models/Verify.js";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// export const sendVerificationCode = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered",
//       });
//     } 
//     const code = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//     await VerificationCode.findOneAndUpdate(
//       { email },
//       { code, expiresAt },
//       { upsert: true } 
//     );
//     // Send email 
//     console.log(email,"hhhhhhhhhhhhhhhhhhh")
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });
//     await transporter.sendMail({
//       from: process.env.SMTP_USER,
//       to: email,
//       subject: "Your Verification Code",
//       text: `Your verification code is ${code}. It expires in 10 minutes.`,
//     });
//     res.json({
//       success: true,
//       message: "Verification code sent to your email.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to send code" });
//   }
// };
// 🆕 Google login controller

export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Generate 6-digit code as string
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10*24 * 60 * 1000); // expires in 10 min

    // Upsert code for the same email
    await VerificationCode.findOneAndUpdate(
      { email: normalizedEmail },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 443,
  secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: normalizedEmail,
      subject: "Your Verification Code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    });

    console.log(`Verification code sent to ${normalizedEmail}: ${code}`);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (err) {
    console.error("Error sending verification code:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code.",
      error: err.message,
    });
  }
};
 
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    // ✅ Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("this is the payload",payload);
    const { sub: googleId, name, email, picture } = payload;
    // ✅ Check or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId,
        username: name,
        email,
        photo: picture,
        provider: "google",
         isGoogleUser: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.provider = "google";
     
      await user.save();
    }

    // ✅ Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid Google token or verification failed",
    });
  }
};
