import "dotenv/config";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"Broker Platform" <${process.env.MAIL_USER}>`,
      to,
      subject: "Verify your email",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    console.log("OTP email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendVerificationSuccessEmail = async (
  to: string,
  csdNumber: string,
  options: { firstName?: string } = {}
) => {
  const greetingName = options.firstName?.trim() ?? "there";

  const textBody = [
    `Hi ${greetingName},`,
    "\n",
    "Your email address has been verified successfully.",
    `Your Central Securities Depository (CSD) number is ${csdNumber}.`,
    "Please keep it in a safe place—you'll need it for all future transactions on the platform.",
  ].join(" ");

  const htmlBody = `
    <div>
      <p>Hi ${greetingName},</p>
      <p>Your email address has been verified successfully.</p>
      <p>
        <strong>Your Central Securities Depository (CSD) number:</strong><br/>
        <span style="font-size:16px;font-weight:bold;letter-spacing:1px;">${csdNumber}</span>
      </p>
      <p>Please store this number securely—you'll need it for future transactions on the platform.</p>
      <p>Thank you for choosing Broker Platform.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Broker Platform" <${process.env.MAIL_USER}>`,
      to,
      subject: "Your account has been verified",
      text: textBody,
      html: htmlBody,
    });

    console.log("Verification success email sent to:", to);
  } catch (error) {
    console.error("Error sending verification success email:", error);
  }
};
