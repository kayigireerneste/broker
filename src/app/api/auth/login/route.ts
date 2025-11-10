import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    if (!user.isVerified) {
      if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
        return NextResponse.json({ error: "OTP expired. Please request a new OTP." }, { status: 400 });
      }
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const token = await generateToken({ id: user.id, role: user.role });
    return NextResponse.json({ 
      message: "Logged in successfully",
      token, 
      user: { id: user.id, role: user.role, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ 
      error: "Login failed", 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
