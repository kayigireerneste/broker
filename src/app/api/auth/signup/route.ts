/* eslint-disable @typescript-eslint/no-unused-vars */
// Update the import path to match your actual Prisma client location
import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/utils/mailer";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { validateSignupFields } from "@/validation/auth/signupValidation";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      idNumber,
      dateOfBirth,
      address,
      occupation,
      investmentExperience,
    } = data;

    const validation = validateSignupFields(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      console.error("Database error checking existing user:", dbErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    let hashed;
    try {
      hashed = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error("Password hashing error:", hashErr);
      return NextResponse.json({ error: "Password hashing failed" }, { status: 500 });
    }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    let user;
    try {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashed,
          idNumber,
          dateOfBirth: new Date(dateOfBirth),
          address,
          occupation,
          investmentExperience,
          role: "CLIENT",
          otp,
          otpExpiresAt,
        },
      });
    } catch (createErr) {
      console.error("Database error creating user:", createErr);
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error("Error sending OTP email:", emailErr);
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent to email for verification" });
  } catch (err) {
    console.error("Unexpected error in signup route:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
