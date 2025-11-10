import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
	buildSaleOrderData,
	handleSaleOrderApiError,
	normalizeSaleItems,
	saleOrderCreateSchema,
} from "./helpers";

export async function GET() {
	try {
		const orders = await prisma.saleOrder.findMany({
			orderBy: { createdAt: "desc" },
			include: { items: true },
		});
		return NextResponse.json({ data: orders });
	} catch (error) {
		return handleSaleOrderApiError(error, "Failed to fetch sale orders");
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const payload = saleOrderCreateSchema.parse(body);
		const items = normalizeSaleItems(payload.items);

		if (items.length === 0) {
			return NextResponse.json({ error: "At least one valid order item is required" }, { status: 400 });
		}

		const data = buildSaleOrderData(payload);

		const createData = {
			...data,
			termsAccepted: true,
			bestMarketPrice: payload.bestMarketPrice ?? false,
			priceLimit: payload.priceLimit ?? false,
			items: {
				create: items,
			},
		};

		const cleanedCreateData = Object.fromEntries(
			Object.entries(createData).filter(([, value]) => value !== undefined)
		) as unknown as Prisma.SaleOrderCreateInput;

		const order = await prisma.saleOrder.create({
			data: cleanedCreateData,
			include: { items: true },
		});

		return NextResponse.json({ data: order }, { status: 201 });
	} catch (error) {
		return handleSaleOrderApiError(error, "Failed to create sale order");
	}
}
