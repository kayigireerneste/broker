import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "swagger.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    const document = JSON.parse(fileContents);

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to load OpenAPI specification", error);
    return NextResponse.json(
      {
        error: "Unable to load OpenAPI specification",
      },
      { status: 500 }
    );
  }
}
