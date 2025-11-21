import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// POST /api/webhooks/paypack - Handle Paypack payment notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("Paypack webhook received:", body);

    const { ref, status, amount } = body;

    if (!ref) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Find the transaction by reference
    const transaction = await prisma.transaction.findFirst({
      where: { reference: ref },
    });

    if (!transaction) {
      console.log("Transaction not found for reference:", ref);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Check if payment was successful
    const isSuccess = status?.toUpperCase() === "SUCCESS" || status?.toUpperCase() === "SUCCESSFUL";

    if (isSuccess && transaction.status === "PENDING") {
      // Update transaction and wallet in a database transaction
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "COMPLETED",
            metadata: {
              ...(transaction.metadata as object),
              webhookData: body,
              completedAt: new Date().toISOString(),
            },
          },
        });

        // Update wallet balance
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: {
            balance: {
              increment: new Prisma.Decimal(amount || transaction.amount),
            },
          },
        });
      });

      console.log("Payment confirmed and wallet updated for:", ref);
    } else if (status?.toUpperCase() === "FAILED") {
      // Update transaction as failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          metadata: {
            ...(transaction.metadata as object),
            webhookData: body,
            failedAt: new Date().toISOString(),
          },
        },
      });

      console.log("Payment failed for:", ref);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
