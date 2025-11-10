import { Prisma } from "@prisma/client";
import { getCode } from "country-list";

const COUNTRY_SEGMENT_MAX_LENGTH = 4;
const DEFAULT_COUNTRY_SEGMENT = "NOC";

const pad = (value: number, length = 2): string => value.toString().padStart(length, "0");

const buildDateSegment = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}${month}${day}`;
};

const buildGenderSegment = (genderRaw: string | null | undefined): "1" | "2" =>
  genderRaw?.trim().toLowerCase() === "female" ? "2" : "1";

const buildCountrySegment = (countryRaw: string | null | undefined): string => {
  if (!countryRaw) {
    return DEFAULT_COUNTRY_SEGMENT;
  }

  const trimmed = countryRaw.trim();
  const isoCode = getCode(trimmed);
  if (isoCode) {
    return isoCode.toUpperCase();
  }

  const lettersOnly = trimmed.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (!lettersOnly) {
    return DEFAULT_COUNTRY_SEGMENT;
  }

  if (lettersOnly.length <= COUNTRY_SEGMENT_MAX_LENGTH) {
    return lettersOnly;
  }

  return lettersOnly.slice(0, COUNTRY_SEGMENT_MAX_LENGTH);
};

const buildSerialSegment = (serial: number): string => `0${serial}`;

export type CsdNumberParams = {
  gender: string | null | undefined;
  country: string | null | undefined;
  now?: Date;
};

export const buildCsdNumberComponents = ({ gender, country, now }: CsdNumberParams) => {
  const date = now ?? new Date();
  const dateSegment = buildDateSegment(date);
  const genderSegment = buildGenderSegment(gender);
  const countrySegment = buildCountrySegment(country);
  return { dateSegment, genderSegment, countrySegment };
};

export const generateCsdNumber = async (
  tx: Prisma.TransactionClient,
  params: CsdNumberParams
): Promise<string> => {
  const { dateSegment, genderSegment, countrySegment } = buildCsdNumberComponents(params);
  const prefix = `${dateSegment} ${genderSegment} ${countrySegment}`;

  const existingCount = await tx.user.count({
    where: { csdNumber: { startsWith: prefix } },
  });

  const serial = existingCount + 1;
  const serialSegment = buildSerialSegment(serial);

  return `${prefix}${serialSegment}`;
};
type AssignmentOptions = {
  extraData?: Prisma.UserUpdateInput;
  maxAttempts?: number;
  now?: Date;
};

const UNIQUE_VIOLATION_CODE = "P2002";

export const ensureCsdNumberAssignment = async (
  tx: Prisma.TransactionClient,
  user: { id: string; gender: string | null; country: string | null; csdNumber: string | null },
  options: AssignmentOptions = {}
): Promise<string> => {
  const { extraData = {}, maxAttempts = 5, now } = options;

  if (user.csdNumber) {
    if (Object.keys(extraData).length > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: extraData,
      });
    }
    return user.csdNumber;
  }

  let attemptsRemaining = maxAttempts;
  while (attemptsRemaining > 0) {
    const candidate = await generateCsdNumber(tx, {
      gender: user.gender,
      country: user.country,
      now,
    });

    try {
      await tx.user.update({
        where: { id: user.id },
        data: { ...extraData, csdNumber: candidate },
      });
      return candidate;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION_CODE
      ) {
        attemptsRemaining -= 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unable to allocate a unique CSD number after multiple attempts");
};
