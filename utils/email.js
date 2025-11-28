import nodemailer from "nodemailer";

/* ------------------ GENERIC EMAIL SENDER ------------------ */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `Your App <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    await transporter.sendMail(mailOptions);
    console.log("📨 Email sent to:", to);

  } catch (err) {
    console.error("❌ Email sending error:", err);
    throw new Error("Failed to send email");
  }
};

/* ------------------ VERIFICATION CODE EMAIL ------------------ */
export const sendVerificationCodeEmail = async (email, code) => {
  const subject = "Your Verification Code";
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;

  const html = `
    <h2>Your Verification Code</h2>
    <p style="font-size:20px; font-weight:bold;">${code}</p>
    <p>This code expires in 10 minutes.</p>
  `;

  await sendEmail(email, subject, text, html);
};

/* ------------------ INACTIVE USER EMAIL ------------------ */
export const sendInactiveUserEmail = async (email, username) => {
  const subject = "We Miss You! Come Back to the App ❤️";

  const text = `
Hi ${username || "there"},
We noticed you haven’t been active on the app recently. 
We’re constantly improving and adding new features you’ll love.

Come back and explore!
`;

  const html = `
    <h2>We Miss You, ${username || "Friend"} ❤️</h2>
    <p>It looks like you haven't been active for a while.</p>
    <p>We’ve added new helpful features, tips, and tools we think you’ll enjoy.</p>
    <p><strong>Come back and check what's new!</strong></p>
    <br>
    <a 
      href="http://localhost:5174/login" 
      style="padding:10px 20px; background:#4CAF50; color:white; 
             text-decoration:none; border-radius:5px;">
      Open the App
    </a>
    <br><br>
    <p>See you soon!</p>
  `;

  await sendEmail(email, subject, text, html);
};
