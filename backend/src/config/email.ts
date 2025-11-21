import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// CJS backend → built-in __dirname is available
const logoPath = path.join(__dirname, "../../../frontend/assets/images/unimigo_letter_logo.png");

let base64Logo = "";
try {
  if (fs.existsSync(logoPath)) {
    const imageBuffer = fs.readFileSync(logoPath);
    base64Logo = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    console.log("Resolved Logo Path:", logoPath);
    console.log("File exists?", true);
  } else {
    throw new Error("File not found");
  }
} catch (err) {
  console.error(" Logo image not found. Using placeholder.");
  base64Logo =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
  maxConnections: 5,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

export const sendOTPEmail = async (email: string, otp: string, universityName: string) => {
  const firstName = email.split("@")[0].split(".")[0];

  const mailOptions = {
    from: `"UNIMIGO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your UNIMIGO Login OTP",
    html: `
<div style="
  font-family: Arial, sans-serif; 
  max-width: 600px; 
  margin: auto; 
  background: #ffffff; 
  border-radius: 14px; 
  overflow: hidden; 
  border: 1px solid #e5e5e5;
">

  <!-- HEADER -->
  <div style="
    background: linear-gradient(135deg, #00B4D8 0%, #FF7A00 100%);
    padding: 40px 20px;
    text-align: center;
  ">
    <img 
      src="${base64Logo}" 
      alt="UNIMIGO Logo" 
      style="width: 120px; height: auto; margin-bottom: 12px;" 
    />
    <h1 style="
      color: #ffffff; 
      margin: 0; 
      font-size: 32px; 
      font-weight: 700;
      letter-spacing: 1px;
    ">
      UNIMIGO
    </h1>
    <p style="
      color: #000000;
      margin: 6px 0 0; 
      font-size: 15px;
    ">
      Your Campus, Your Circle
    </p>
  </div>

  <!-- BODY -->
  <div style="padding: 32px;">
    <h2 style="
      color: #333; 
      font-size: 22px; 
      margin: 0;
    ">
      Hello ${firstName},
    </h2>

    <p style="
      color: #555; 
      font-size: 16px; 
      margin-top: 12px;
      line-height: 1.6;
    ">
      Your verification code to access <strong>${universityName}</strong> on UNIMIGO is given below.
      Please use this OTP to complete your login.
    </p>

    <!-- OTP BOX -->
    <div style="
      background: #f0fbff;
      padding: 30px;
      text-align: center;
      border-radius: 12px;
      margin: 28px 0;
      border: 1px solid #d9f2ff;
    ">
      <span style="
        font-size: 48px; 
        color: #00B4D8; 
        font-weight: bold; 
        letter-spacing: 10px;
        display: inline-block;
      ">
        ${otp}
      </span>
    </div>

    <p style="color:#555; font-size:14px; margin: 0 0 10px;">
      This OTP is valid for <strong>10 minutes</strong>.
    </p>
    <p style="color:#555; font-size:14px; margin: 0;">
      If you did not request this, please ignore the email.
    </p>
  </div>

  <!-- FOOTER -->
  <div style="
    background: #0d0d0d; 
    padding: 18px; 
    text-align: center;
  ">
    <p style="
      color: #aaa; 
      font-size: 12px; 
      margin: 0;
    ">
      © 2025 UNIMIGO. All rights reserved.
    </p>
  </div>
</div>
`
,
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;
