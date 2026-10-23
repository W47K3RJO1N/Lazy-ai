import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AIService } from "@/lib/ai-service";

const OrganizeRequestSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().min(1),
        size: z.number().nonnegative(),
        type: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .min(1, "Please provide at least one file to organize")
    .max(50, "Limit of 50 files per organization job"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrganizeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { files } = parsed.data;
    const result = await AIService.organizeFiles(files);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal organization error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
