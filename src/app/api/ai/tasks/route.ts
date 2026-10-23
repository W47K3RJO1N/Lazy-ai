import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AIService } from "@/lib/ai-service";

const TasksRequestSchema = z.object({
  notes: z
    .string()
    .min(5, "Notes must contain at least 5 characters")
    .max(50000, "Notes text exceeds maximum limit"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TasksRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { notes } = parsed.data;
    const result = await AIService.extractTasks(notes);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal task extraction error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
