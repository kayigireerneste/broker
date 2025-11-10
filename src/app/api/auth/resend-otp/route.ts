/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/utils/mailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ message: "User already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    await sendOTPEmail(email, otp);
    return NextResponse.json({ message: "OTP resent to email" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to resend OTP" }, { status: 500 });
  }
}
