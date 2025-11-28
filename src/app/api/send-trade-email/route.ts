import { NextRequest, NextResponse } from "next/server";
import { sendTradeConfirmationEmail } from "@/utils/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, tradeType, companySymbol, companyName, quantity, pricePerShare, totalAmount, newBalance } = await req.json();

    await sendTradeConfirmationEmail(email, fullName, {
      tradeType,
      companySymbol,
      companyName,
      quantity,
      pricePerShare,
      totalAmount,
      newBalance,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
