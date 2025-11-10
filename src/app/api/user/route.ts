import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
	ForbiddenError,
	UnauthorizedError,
	requireUserManagementRole,
	USER_MANAGEMENT_ROLES,
} from "@/utils/_helpers";
import { signupSchema, type SignupPayload } from "@/lib/validations/signupValidation";
import { ensureCsdNumberAssignment } from "@/lib/csdNumber";

const userSelect = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	phoneCountryCode: true,
	phone: true,
	idNumber: true,
	csdNumber: true,
	passportPhoto: true,
	idDocument: true,
	dateOfBirth: true,
	gender: true,
	country: true,
	city: true,
	occupation: true,
	investmentExperience: true,
	notificationPreferences: true,
	role: true,
	isVerified: true,
	createdBy: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
		},
	},
	otp: false,
	otpExpiresAt: false,
	createdAt: true,
	updatedAt: true,
} as const;

const adminCreateExtrasSchema = z.object({
	notificationPreferences: z.any().optional(),
	role: z.nativeEnum(Role).optional(),
	isVerified: z.boolean().optional(),
});

type UserResponse = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneCountryCode: string;
	phone: string;
	idNumber: string;
	csdNumber: string | null;
	passportPhoto: string | null;
	idDocument: string | null;
	dateOfBirth: Date;
	gender: string;
	country: string;
	city: string;
	occupation: string;
	investmentExperience: string;
	notificationPreferences: Prisma.JsonValue | null;
	role: Role;
	isVerified: boolean;
	createdBy: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: Role;
	} | null;
	createdAt: Date;
	updatedAt: Date;
};

function handleError(error: unknown, fallbackMessage: string) {
	if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
		return NextResponse.json({ error: error.message }, { status: error.status });
	}

	if (error instanceof z.ZodError) {
		const issues = error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
		}));

		return NextResponse.json(
			{
				error: issues[0]?.message ?? "Invalid input data",
				errors: issues,
			},
			{ status: 400 }
		);
	}

	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
		return NextResponse.json({ error: "A user with the provided unique field already exists" }, { status: 409 });
	}

	console.error(fallbackMessage, error);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

export async function GET(request: Request) {
	try {
		const auth = await requireUserManagementRole(request);
		const where: Prisma.UserWhereInput | undefined =
			auth.role === Role.AGENT
				? ({
					      role: Role.CLIENT,
					      createdById: auth.id,
				      } as unknown as Prisma.UserWhereInput)
				: undefined;
		const users = (await prisma.user.findMany({
			where,
			select: userSelect as unknown as Prisma.UserSelect,
			orderBy: { createdAt: "desc" },
		})) as unknown as UserResponse[];
		return NextResponse.json({ data: users });
	} catch (error) {
		return handleError(error, "Failed to fetch users");
	}
}

export async function POST(request: Request) {
	try {
		const auth = await requireUserManagementRole(request);
		if (!USER_MANAGEMENT_ROLES.includes(auth.role)) {
			throw new ForbiddenError();
		}

		const body = await request.json();
		const payloadForValidation = {
			...body,
			confirmPassword: body?.confirmPassword ?? body?.password,
		};

		const parsedBase: SignupPayload = signupSchema.parse(payloadForValidation);
		const parsedExtras = adminCreateExtrasSchema.parse(body);

		if (auth.role === Role.AGENT && parsedExtras.role && parsedExtras.role !== Role.CLIENT) {
			throw new ForbiddenError("Agents can only create client accounts");
		}

		const { password, dateOfBirth, passportPhoto, idDocument, gender, ...rest } = parsedBase;
		const hashedPassword = await bcrypt.hash(password, 10);
		const now = new Date();
		const targetIsVerified = parsedExtras.isVerified ?? true;

		const createData: Record<string, unknown> = {
			...rest,
			gender: gender.trim().toLowerCase(),
			password: hashedPassword,
			dateOfBirth: new Date(dateOfBirth),
			csdNumber: null,
			passportPhoto,
			idDocument,
			notificationPreferences: parsedExtras.notificationPreferences ?? undefined,
			role: parsedExtras.role ?? Role.CLIENT,
			isVerified: targetIsVerified,
			otp: null,
			otpExpiresAt: null,
			createdBy:
				auth.role === Role.AGENT
					? {
					      connect: { id: auth.id },
				      }
					: undefined,
		};

		const newUser = (await prisma.$transaction(async (tx) => {
			const created = (await tx.user.create({
				data: createData as Prisma.UserCreateInput,
				select: userSelect as unknown as Prisma.UserSelect,
			})) as unknown as UserResponse;

			if (!targetIsVerified) {
				return created;
			}

			await ensureCsdNumberAssignment(
				tx,
				{
					id: created.id,
					gender: created.gender,
					country: created.country,
					csdNumber: created.csdNumber,
				},
				{ now }
			);

			return (await tx.user.findUnique({
				where: { id: created.id },
				select: userSelect as unknown as Prisma.UserSelect,
			})) as unknown as UserResponse;
		})) as unknown as UserResponse;

		return NextResponse.json({ data: newUser }, { status: 201 });
	} catch (error) {
		return handleError(error, "Failed to create user");
	}
}
