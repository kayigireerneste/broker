import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { companyCreateSchema } from "@/lib/validations/companyValidation";
import { ForbiddenError, UnauthorizedError, requireUserManagementRole } from "@/utils/_helpers";
import { z } from "zod";
import { companySelect } from "./companySelect";
import { toDecimalOrUndefined } from "./utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    const where: Prisma.CompanyWhereInput | undefined = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { ticker: { contains: query, mode: "insensitive" } },
            { sector: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined;

    const companies = await prisma.company.findMany({
      where,
      select: companySelect,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("Failed to fetch companies", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUserManagementRole(request, [Role.SUPER_ADMIN, Role.COMPANY]);

    const json = await request.json();
    const parsed = companyCreateSchema.parse(json);

    const sharePrice = toDecimalOrUndefined(parsed.sharePrice);
    const closingPrice = toDecimalOrUndefined(parsed.closingPrice);
    const previousClosingPrice = toDecimalOrUndefined(parsed.previousClosingPrice);
    const tradedVolume = toDecimalOrUndefined(parsed.tradedVolume);
    const tradedValue = toDecimalOrUndefined(parsed.tradedValue);
    const snapshotDate = parsed.snapshotDate ? new Date(parsed.snapshotDate) : undefined;

    const company = await prisma.company.create({
      data: {
        name: parsed.name,
        ticker: parsed.ticker,
        description: parsed.description ?? null,
        sector: parsed.sector ?? null,
        sharePrice,
        totalShares: parsed.totalShares ?? undefined,
        availableShares: parsed.availableShares ?? undefined,
        closingPrice,
        previousClosingPrice,
        priceChange: parsed.priceChange?.trim() || null,
        tradedVolume,
        tradedValue,
        snapshotDate,
        contract: parsed.contract?.trim() || null,
        createdBy: {
          connect: { id: auth.id },
        },
      },
      select: companySelect,
    });

    return NextResponse.json({ data: company }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A company with the provided ticker already exists" }, { status: 409 });
    }

    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      return NextResponse.json({
        error: issue?.message ?? "Invalid company data",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    if (error instanceof Error && error.message.toLowerCase().includes("decimal")) {
      return NextResponse.json({ error: "Share price must be a valid number" }, { status: 400 });
    }

    console.error("Failed to create company", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
