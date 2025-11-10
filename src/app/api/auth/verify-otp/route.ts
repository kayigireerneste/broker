/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { ensureCsdNumberAssignment } from "@/lib/csdNumber";
import { NextResponse } from "next/server";
import { sendVerificationSuccessEmail } from "@/utils/mailer";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.isVerified)
      return NextResponse.json({ message: "Already verified" });

    if (user.otp !== otp || user.otpExpiresAt! < new Date())
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

    const now = new Date();

    const csdNumber = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: user.id },
        select: { id: true, country: true, csdNumber: true },
      });

      if (!target) {
        throw new Error("User vanished during verification");
      }

      return ensureCsdNumberAssignment(
        tx,
        {
          id: target.id,
          country: target.country,
          csdNumber: target.csdNumber,
          gender: null
        },
        { now, extraData: { isVerified: true, otp: null, otpExpiresAt: null } },
      );
    });

    const firstName = user.fullName?.split(" ")[0] ?? "there";

    // send greeting using the user's fullName (schema now uses fullName)
    await sendVerificationSuccessEmail(user.email, csdNumber, { firstName });

    return NextResponse.json({ message: "Email verified successfully", csdNumber });
  } catch (err) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
