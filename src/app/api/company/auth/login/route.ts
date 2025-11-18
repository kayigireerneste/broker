import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log("Company login attempt for email:", email);

    const company = await prisma.company.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        csdNumber: true,
        symbol: true,
        isVerified: true,
        country: true,
        city: true,
        phoneCountryCode: true,
        phone: true,
      },
    });

    if (!company) {
      console.log("Company not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    console.log("Company found:", company.email);

    const passwordMatch = await bcrypt.compare(password, company.password);

    if (!passwordMatch) {
      console.log("Password mismatch");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    if (!company.isVerified) {
      console.log("Company not verified");
      return NextResponse.json(
        { error: "Company account is not verified. Please contact admin." },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        id: company.id,
        email: company.email,
        type: "company",
        csdNumber: company.csdNumber,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Company login successful");

    const { password: _, ...companyData } = company;

    return NextResponse.json({
      message: "Login successful",
      token,
      company: {
        ...companyData,
        role: "COMPANY",
      },
    });
  } catch (error) {
    console.error("Company login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
