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
// export const sendVerificationCodeEmail = async (email, code) => {
//   const subject = "Your Verification Code";
//   const text = `Your verification code is ${code}. It expires in 10 minutes.`;

//   const html = `
//     <h2>Your Verification Code</h2>
//     <p style="font-size:20px; font-weight:bold;">${code}</p>
//     <p>This code expires in 10 minutes.</p>
//   `;

//   await sendEmail(email, subject, text, html);
// };
export const sendVerificationCodeEmail = async (email, code) => {
  const subject = "Your Verification Code";

  const text = `Your verification code is ${code}. It expires in 10 minutes.`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:20px;">
    
    <div style="
      max-width:550px;
      margin:auto;
      background:white;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0px 4px 20px rgba(0,0,0,0.08);
    ">
      
      <!-- HEADER -->
      <div style="background:#4CAF50; padding:20px; text-align:center;">
        <img 
          src="https://your-logo-url.com/logo.png" 
          alt="App Logo" 
          style="height:60px;"
        />
      </div>

      <!-- BODY -->
      <div style="padding:30px;">
        <h2 style="text-align:center; color:#333; margin-bottom:10px;">
          Your Verification Code
        </h2>

        <p style="font-size:15px; color:#555; text-align:center;">
          Use the code below to verify your account.  
        </p>

        <div style="
          background:#f0f7ff;
          border:1px solid #d3e5ff;
          padding:18px;
          border-radius:8px;
          margin:25px 0;
          text-align:center;
        ">
          <span style="
            font-size:32px; 
            font-weight:bold; 
            letter-spacing:4px; 
            color:#004aad;
          ">
            ${code}
          </span>
        </div>

        <p style="font-size:14px; color:#777; text-align:center;">
          This code expires in <strong>10 minutes</strong>.  
          Please do not share it with anyone.
        </p>
      </div>

      <!-- FOOTER -->
      <div style="
        background:#f1f1f1;
        padding:15px;
        text-align:center;
        font-size:12px;
        color:#777;
      ">
        © ${new Date().getFullYear()} Your App Name. All rights reserved.
      </div>

    </div>

  </div>
  `;

  await sendEmail(email, subject, text, html);
};

/* ------------------ INACTIVE USER EMAIL ------------------ */
// export const sendInactiveUserEmail = async (email, username) => {
//   const subject = "We Miss You! Come Back to the App ❤️";

//   const text = `
// Hi ${username || "there"},
// We noticed you haven’t been active on the app recently. 
// We’re constantly improving and adding new features you’ll love.

// Come back and explore!
// `;

//   const html = `
//     <h2>We Miss You, ${username || "Friend"} ❤️</h2>
//     <p>It looks like you haven't been active for a while.</p>
//     <p>We’ve added new helpful features, tips, and tools we think you’ll enjoy.</p>
//     <p><strong>Come back and check what's new!</strong></p>
//     <br>
//     <a 
//       href="http://localhost:5174/login" 
//       style="padding:10px 20px; background:#4CAF50; color:white; 
//              text-decoration:none; border-radius:5px;">
//       Open the App
//     </a>
//     <br><br>
//     <p>See you soon!</p>
//   `;

//   await sendEmail(email, subject, text, html);
// };
export const sendInactiveUserEmail = async (email, username) => {
  const subject = "We Miss You! Come Back to the App ❤️";

  const text = `
Hi ${username || "there"},
We noticed you haven’t been active recently. 
We’ve added new helpful features, tips, and tools we think you’ll enjoy.

Come back and explore!
`;

//   const html = `
//   <div style="margin:0; padding:0; background:#f5f7fb; font-family:Arial, sans-serif;">

//     <table align="center" width="100%" cellpadding="0" cellspacing="0" 
//       style="max-width:600px; margin:auto; background:white; border-radius:12px; 
//       box-shadow:0px 4px 15px rgba(0,0,0,0.07); overflow:hidden;">
      
//       <!-- HEADER / LOGO -->
//       <tr>
//         <td style="background:#ffffff; padding:20px; text-align:center; width: 100%">
//           <img src="https://res.cloudinary.com/dqcimdgce/image/upload/v1764434864/mylogo_JANEEN_isd8sf.png"
//             alt="App Logo"
//             style="height:60px;">
//         </td>
//       </tr>      

//       <!-- HERO IMAGE -->
//       <tr>
//       <td style="text-align:center; padding:10px; width:100%;">
//   <img src="https://res.cloudinary.com/dqcimdgce/image/upload/v1764438821/www_j3k3n8.jpg"
//        alt="We Miss You"
//        style="width:100%; max-width:300px; border-radius:10px;">
// </td>

//       </tr>

//       <!-- TITLE -->
//       <tr>
//         <td style="padding:20px 30px 10px 30px; text-align:center;">
//           <h2 style="margin:0; font-size:24px; color:#333;">
//             Hi ${username || "there"}, We Miss You ❤️
//           </h2>
//         </td>
//       </tr>

     
//       <!-- MESSAGE BODY -->
// <tr>
//   <td style="padding:0 30px;">
    
//     <!-- Background Box -->
//     <table width="100%" border="0" cellspacing="0" cellpadding="0" 
//            style="background:#f7f9fc; border-radius:12px; padding:20px;">
//       <tr>
//         <td style="font-size:15px; color:#444; line-height:22px; padding:20px;">
          
//           <p style="margin:0 0 12px;">
//             We noticed that you haven't been active on the app lately.
//           </p>

//           <p style="margin:0 0 12px;">
//             We've been working hard to improve your experience — adding new features,
//             helpful tools, and personalized content you'll love.
//           </p>

//           <p style="margin:0;">
//             <strong>Come back and see what's new!</strong>
//           </p>

//         </td>
//       </tr>
//     </table>

//   </td>
// </tr>


//       <!-- BUTTON -->
//       <tr>
//         <td style="text-align:center; padding:20px 30px;">
//           <a 
//             href="http://localhost:5174/login"
//             style="
//               background:#3b82f6;
//               color:white;
//               padding:12px 25px;
//               font-size:16px;
//               text-decoration:none;
//               border-radius:8px;
//               display:inline-block;
//               font-weight:bold;
//               box-shadow:0px 2px 8px rgba(0,0,0,0.15);
//             ">
//             Open the App
//           </a>
//         </td>
//       </tr>

//       <!-- FOOTER -->
//       <tr>
//         <td style="background:#f0f2f5; padding:15px; text-align:center; font-size:12px; color:#777;">
//           © ${new Date().getFullYear()} JANEEN APP — All rights reserved.
//         </td>
//       </tr>

//     </table>

//   </div>
//   `;

const html=
`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>We Miss You</title>
</head>

<body style="margin:0; padding:0; background:#f4f7fa; font-family:Arial, sans-serif;">

  <!-- MAIN WRAPPER -->
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fa; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- EMAIL CONTAINER -->
        <table width="600" cellpadding="0" cellspacing="0" 
               style="background:white; border-radius:12px; overflow:hidden;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding:30px;">
              <img src="https://res.cloudinary.com/dqcimdgce/image/upload/v1764434864/mylogo_JANEEN_isd8sf.png"
                   alt="App Logo"
                   style="max-width:140px;">
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td align="center" style="padding:0 30px;">
              <h1 style="font-size:24px; color:#222; margin:0;">
                A lot has changed since you last visited
              </h1>
            </td>
          </tr>

          <!-- SUBTITLE -->
          <tr>
            <td align="center" style="padding:10px 40px 25px; color:#555; font-size:15px; line-height:22px;">
              We've added new features, improvements, and experiences created just for you.
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td align="center" style="padding:10px 0 25px;">
              <a href="http://localhost:5174/login"
                 style="padding:12px 25px; background:#4CAF50; color:white; 
                        font-size:16px; border-radius:6px; text-decoration:none;">
                See what's new
              </a>
            </td>
          </tr>

          <!-- SECTION TITLE -->
          <tr>
            <td align="center" style="padding:10px 0;">
              <h2 style="margin:0; font-size:20px; color:#333;">
                Come back to:
              </h2>
            </td>
          </tr>

          <!-- FEATURE BLOCKS -->
          <tr>
            <td style="padding:20px 30px;">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <!-- FEATURE 1 -->
                  <td width="50%" valign="top" style="padding:10px;">
                    <img src="https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg"
                         alt="Feature 1"
                         style="width:100%; border-radius:10px;">
                    <h3 style="font-size:16px; margin:10px 0 5px; color:#222;">
                      New Dashboard
                    </h3>
                    <p style="font-size:14px; color:#555; margin:0;">
                      Navigate easier with a faster, redesigned experience.
                    </p>
                  </td>

                  <!-- FEATURE 2 -->
                  <td width="50%" valign="top" style="padding:10px;">
                    <img src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
                         alt="Feature 2"
                         style="width:100%; border-radius:10px;">
                    <h3 style="font-size:16px; margin:10px 0 5px; color:#222;">
                      Smart Recommendations
                    </h3>
                    <p style="font-size:14px; color:#555; margin:0;">
                      Personalized suggestions based on your preferences.
                    </p>
                  </td>

                </tr>

                <tr>

                  <!-- FEATURE 3 -->
                  <td width="50%" valign="top" style="padding:10px;">
                    <img src="https://images.pexels.com/photos/1181353/pexels-photo-1181353.jpeg"
                         alt="Feature 3"
                         style="width:100%; border-radius:10px;">
                    <h3 style="font-size:16px; margin:10px 0 5px; color:#222;">
                      Faster Performance
                    </h3>
                    <p style="font-size:14px; color:#555; margin:0;">
                      Enjoy smoother animations and faster load times.
                    </p>
                  </td>

                  <!-- FEATURE 4 -->
                  <td width="50%" valign="top" style="padding:10px;">
                    <img src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg"
                         alt="Feature 4"
                         style="width:100%; border-radius:10px;">
                    <h3 style="font-size:16px; margin:10px 0 5px; color:#222;">
                      Fresh Weekly Content
                    </h3>
                    <p style="font-size:14px; color:#555; margin:0;">
                      New guides, articles & tips added every week.
                    </p>
                  </td>

                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER CTA -->
          <tr>
            <td align="center" style="padding:25px;">
              <a href="http://localhost:5174/login"
                 style="padding:12px 25px; background:#4CAF50; color:white; 
                        font-size:16px; border-radius:6px; text-decoration:none;">
                Return to the App
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:20px; color:#888; font-size:12px;">
              © 2025 janeen • All Rights Reserved <br>
              You are receiving this email because your account is inactive.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

`
  await sendEmail(email, subject, text, html);
};
