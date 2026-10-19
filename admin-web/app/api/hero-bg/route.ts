import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const filePath = "/Users/mac/.gemini/antigravity-ide/brain/ee22833f-a84b-4f04-95e9-caa6a92a77ea/media__1789064309167.jpg";

  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new NextResponse("Image not found", { status: 404 });
}
