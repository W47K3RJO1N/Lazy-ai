import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdf-parse to maintain Vercel edge/node compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);

    const text = data.text?.trim() || "";
    if (!text) {
      return NextResponse.json(
        { error: "Could not extract any readable text from this PDF (it may be scanned or empty)." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      pages: data.numpages,
      info: data.info,
      charCount: text.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to parse PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
