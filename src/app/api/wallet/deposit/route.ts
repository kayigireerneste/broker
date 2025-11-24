import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { paypackClient, PaypackClient, PaypackError } from "@/lib/paypack";

// POST /api/wallet/deposit - Deposit money to wallet
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = auth.userId; // Extract userId for type safety

    const body = await req.json();
    const { amount, paymentMethodId } = body;
    const numericAmount = Number(amount);

    // Validate amount
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum deposit is 1 RWF" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Get payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId: userId, isActive: true },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found or inactive" },
        { status: 404 }
      );
    }

    // Generate unique reference
    const reference = `DEP${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Process payment via Paypack for mobile money
    let paypackResponse: Record<string, unknown> | null = null;
    let externalStatus: string | undefined;
    let externalReference: string | undefined;

    const isTestMode = process.env.NODE_ENV === 'development' && process.env.PAYPACK_TEST_MODE === 'true';
    
    console.log("Paypack environment check:", {
      hasBaseUrl: !!process.env.PAYPACK_BASE_URL,
      hasAppId: !!process.env.PAYPACK_APP_ID,
      hasAppSecret: !!process.env.PAYPACK_APP_SECRET,
      baseUrl: process.env.PAYPACK_BASE_URL,
      isTestMode,
    });

    if (paymentMethod.type === "MOBILE_MONEY") {
      // Use phone number exactly as stored (Paypack expects the whitelisted format)
      const formattedPhone = paymentMethod.accountNumber.trim();

      if (isTestMode) {
        console.log("Test mode: Simulating successful Paypack response");
        paypackResponse = {
          ref: reference,
          status: "SUCCESS",
          amount: numericAmount,
          number: formattedPhone,
          currency: "RWF",
          description: `Wallet deposit for ${userId}`,
          processor_message: "Test mode - payment simulated",
        };
        externalStatus = "SUCCESS";
        externalReference = reference;
      } else {
        try {

        console.log("Initiating Paypack cashIn with:", {
          amount: numericAmount,
          phone: formattedPhone,
          reference,
          description: `Wallet deposit for ${userId}`,
        });

        console.log("Final Paypack cashIn request:", {
          amount: numericAmount,
          phone: formattedPhone,
          reference,
          description: `Wallet deposit for ${userId}`,
        });

        const response = await paypackClient.cashIn({
          amount: numericAmount,
          phone: formattedPhone,
          reference,
          description: `Wallet deposit for ${userId}`,
        });

        console.log("Paypack cashIn response:", response);

        paypackResponse = response;
        externalStatus = typeof response.status === "string" ? response.status : undefined;
        externalReference = (response.ref as string | undefined) ?? reference;

        console.log("Processed Paypack response:", {
          externalStatus,
          externalReference,
          isFailed: PaypackClient.isFailed(externalStatus),
        });

        // Set status as PENDING - will be updated via webhook when user completes payment
        externalStatus = "PENDING";

        if (PaypackClient.isFailed(externalStatus)) {
          await prisma.transaction.create({
            data: {
              userId: userId,
              type: "DEPOSIT",
              amount: new Prisma.Decimal(numericAmount),
              status: "FAILED",
              paymentMethod: `${paymentMethod.type} - ${paymentMethod.provider || ""}`,
              reference,
              description: response.processor_message || "Deposit declined by Paypack",
              metadata: {
                paymentMethodId,
                accountNumber: paymentMethod.accountNumber,
                paypack: JSON.parse(JSON.stringify(response)),
              },
            },
          });

          return NextResponse.json(
            { error: response.processor_message || "Deposit declined" },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Paypack cashIn error details:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          isPaypackError: error instanceof PaypackError,
        });
        
        let message = error instanceof PaypackError ? error.message : "Paypack deposit failed";
        
        // Provide helpful message for unsupported provider error
        if (message.includes('unsupported provider')) {
          message = `Phone number ${formattedPhone} is not whitelisted in your Paypack dashboard. Please add this number to your Paypack merchant account's whitelist before attempting payment.`;
        }

        await prisma.transaction.create({
          data: {
            userId: userId,
            type: "DEPOSIT",
            amount: new Prisma.Decimal(numericAmount),
            status: "FAILED",
            paymentMethod: `${paymentMethod.type} - ${paymentMethod.provider || ""}`,
            reference,
            description: message,
            metadata: {
              paymentMethodId,
              accountNumber: paymentMethod.accountNumber,
              error: error instanceof Error ? error.message : String(error),
            },
          },
        });

        return NextResponse.json({ error: message }, { status: 400 });
        }
      }
    }

    // Create PENDING transaction - will be updated when payment is completed
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        type: "DEPOSIT",
        amount: new Prisma.Decimal(numericAmount),
        status: "PENDING",
        paymentMethod: `${paymentMethod.type} - ${paymentMethod.provider || ""}`,
        reference,
        description: `Deposit via ${paymentMethod.provider || paymentMethod.type}`,
        metadata: {
          paymentMethodId,
          accountNumber: paymentMethod.accountNumber,
          externalStatus,
          externalReference: externalReference || reference,
          paypack: paypackResponse ? JSON.parse(JSON.stringify(paypackResponse)) : null,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Payment initiated. Please complete payment on your phone.",
        transaction,
        status: "PENDING",
        providerReference: externalReference || reference,
      },
      { status: 200 }
    );


  } catch (error) {
    console.error("Error processing deposit:", error);
    return NextResponse.json(
      { error: "Failed to process deposit" },
      { status: 500 }
    );
  }
}
