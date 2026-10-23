import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AIService } from "@/lib/ai-service";

const SummarizeRequestSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters long").max(100000, "Text exceeds maximum limit"),
  title: z.string().default("Document Summary"),
  style: z.enum(["quick", "detailed", "study", "executive", "action_items"]).default("detailed"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SummarizeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { text, title, style } = parsed.data;
    const result = await AIService.summarizeDocument(text, title, style);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal summarization error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
