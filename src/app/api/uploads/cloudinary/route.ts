import { NextResponse, type NextRequest } from "next/server";
import { getCloudinary, getFolderForField } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const DEFAULT_FOLDER = "general_uploads";

const asError = (err: unknown): Error => {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error");
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit" },
        { status: 413 }
      );
    }

    const field = formData.get("field");
    const folder = typeof field === "string" ? getFolderForField(field) : DEFAULT_FOLDER;

    const cloudinary = getCloudinary();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        folder: uploadResult.folder,
      },
      { status: 201 }
    );
  } catch (err) {
    const error = asError(err);
    console.error("Cloudinary upload failed", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Allow": "POST, OPTIONS",
    },
  });
}
