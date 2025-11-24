import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { paypackClient } from "@/lib/paypack";

// POST /api/wallet/check-payment - Check payment status and update wallet
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    // Find the pending transaction
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId, 
        userId: auth.userId, 
        status: "PENDING" 
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
    }

    const metadata = transaction.metadata as Record<string, unknown> | null;
    const externalReference = (metadata?.externalReference as string) || transaction.reference || "";

    try {
      // Check status with Paypack
      const statusCheck = await paypackClient.findTransaction(externalReference);
      const status = statusCheck.status?.toLowerCase();
      
      console.log("Paypack status check:", {
        externalReference,
        rawStatus: statusCheck.status,
        normalizedStatus: status,
        fullResponse: statusCheck,
      });

      if (status === "successful" || status === "success") {
        // Update transaction and wallet
        await prisma.$transaction(async (tx) => {
          // Update transaction status
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "COMPLETED",
              metadata: {
                ...(metadata || {}),
                paypackStatus: JSON.parse(JSON.stringify(statusCheck)),
                completedAt: new Date().toISOString(),
              },
            },
          });

          // Update wallet balance
          await tx.wallet.update({
            where: { userId: auth.userId },
            data: {
              balance: {
                increment: transaction.amount,
              },
            },
          });
        });

        return NextResponse.json({
          message: "Payment confirmed and wallet updated",
          status: "COMPLETED",
        });
      } else if (status === "failed" || status === "declined") {
        // Mark as failed
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "FAILED",
            metadata: {
              ...(metadata || {}),
              paypackStatus: JSON.parse(JSON.stringify(statusCheck)),
              failedAt: new Date().toISOString(),
            },
          },
        });

        return NextResponse.json({
          message: "Payment failed",
          status: "FAILED",
        });
      } else {
        return NextResponse.json({
          message: "Payment still pending",
          status: "PENDING",
        });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      return NextResponse.json({ error: "Could not check payment status" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in check-payment:", error);
    return NextResponse.json({ error: "Failed to check payment" }, { status: 500 });
  }
}