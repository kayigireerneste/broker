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
