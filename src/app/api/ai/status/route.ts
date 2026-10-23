import { NextResponse } from "next/server";
import { AIService } from "@/lib/ai-service";

export async function GET() {
  try {
    const info = AIService.getSafeInfo();
    return NextResponse.json(info);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve status", configured: false, mode: "demo" },
      { status: 500 }
    );
  }
}
