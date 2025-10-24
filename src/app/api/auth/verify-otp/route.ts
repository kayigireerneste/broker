/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.isVerified)
      return NextResponse.json({ message: "Already verified" });

    if (user.otp !== otp || user.otpExpiresAt! < new Date())
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
