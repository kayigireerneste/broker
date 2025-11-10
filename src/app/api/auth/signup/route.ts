import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/utils/mailer";
import { signupSchema, SignupPayload } from "@/lib/validations/signupValidation";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const defaultNotificationPreferences: Prisma.JsonObject = {
  email: true,
  sms: false,
  push: false,
};

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = signupSchema.safeParse(data);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: issues[0]?.message ?? "Invalid signup data",
          errors: issues,
        },
        { status: 400 }
      );
    }

    const validated: SignupPayload = parsed.data;
    const {
      firstName,
      lastName,
      email,
      phoneCountryCode,
      phone,
      password,
      idNumber,
      passportPhoto,
      idDocument,
      dateOfBirth,
      gender,
      country,
      city,
      occupation,
      investmentExperience,
    } = validated;

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
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    let createdUser: { id: string } | null = null;
    try {
      const createData: Record<string, unknown> = {
        firstName,
        lastName,
        email,
        phoneCountryCode,
        phone,
        password: hashed,
        idNumber,
        passportPhoto,
        idDocument,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        country,
        city,
        occupation,
        investmentExperience,
        role: "CLIENT",
        otp,
        otpExpiresAt,
        notificationPreferences: defaultNotificationPreferences,
      };

      createdUser = await prisma.user.create({
        data: createData as Prisma.UserCreateInput,
        select: { id: true },
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

    return NextResponse.json({
      message: "OTP sent to email for verification",
      userId: createdUser?.id,
    });
  } catch (err) {
    console.error("Unexpected error in signup route:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
