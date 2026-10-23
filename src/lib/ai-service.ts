import {
  SummaryResult,
  OrganizerResult,
  TaskExtractionResult,
  SummaryStyle,
  SummaryResultSchema,
  OrganizerResultSchema,
  TaskExtractionResultSchema,
} from "@/types";
import { DeterministicAIService } from "./deterministic-ai";

interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class AIService {
  private static getConfig(): ModelConfig | null {
    const baseUrl = process.env.AI_API_BASE_URL;
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "qwen/qwen-2.5-72b-instruct";

    if (!baseUrl || !apiKey) {
      return null;
    }

    return {
      baseUrl: baseUrl.replace(/\/+$/, ""),
      apiKey,
      model,
    };
  }

  public static isConfigured(): boolean {
    return this.getConfig() !== null;
  }

  public static getSafeInfo() {
    const config = this.getConfig();
    return {
      configured: !!config,
      model: config?.model || "qwen/qwen-2.5-72b-instruct (Demo Mode)",
      baseUrl: config ? new URL(config.baseUrl).host : "None (Deterministic Demo)",
      mode: (config ? "real" : "demo") as "real" | "demo",
    };
  }

  /**
   * Helper to execute chat completions with an OpenAI-compatible endpoint
   */
  private static async callOpenAICompatible(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs = 30000
  ): Promise<string> {
    const config = this.getConfig();
    if (!config) {
      throw new Error("AI provider is not configured. Falling back to Demo Mode.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Model provider returned HTTP ${response.status}: ${errorText.substring(0, 200)}`
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response returned by the AI provider.");
      }
      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Summarize Document with fallback
   */
  public static async summarizeDocument(
    text: string,
    title: string,
    style: SummaryStyle
  ): Promise<SummaryResult> {
    if (!this.isConfigured()) {
      return DeterministicAIService.summarize(text, title, style);
    }

    const systemPrompt = `You are LazyFlow AI's document summarization engine. You must output valid, strictly parseable JSON adhering to this schema:
{
  "title": string,
  "style": string,
  "overview": string,
  "keyPoints": string[],
  "importantConcepts": string[],
  "actionItems": string[],
  "originalCharCount": number,
  "summaryCharCount": number
}
Do not include markdown ticks, conversational text, or anything outside of the JSON object.`;

    const userPrompt = `Document Title: ${title}
Summary Style: ${style}
Document Content:
${text.slice(0, 16000)}`;

    try {
      const rawJson = await this.callOpenAICompatible(systemPrompt, userPrompt);
      const parsed = JSON.parse(rawJson);
      return SummaryResultSchema.parse({
        ...parsed,
        title: title || parsed.title || "Document Summary",
        style,
        originalCharCount: text.length,
        summaryCharCount: JSON.stringify(parsed).length,
        isDemo: false,
        processedAt: Date.now(),
      });
    } catch (err: unknown) {
      console.warn("Real AI summarization failed, falling back to deterministic processing:", err);
      const fallback = DeterministicAIService.summarize(text, title, style);
      return { ...fallback, isDemo: true };
    }
  }

  /**
   * Smart File Organizer with fallback
   */
  public static async organizeFiles(
    files: Array<{ name: string; size: number; type?: string; description?: string }>
  ): Promise<OrganizerResult> {
    if (!this.isConfigured()) {
      return DeterministicAIService.organize(files);
    }

    const systemPrompt = `You are LazyFlow AI's file organization planner. Analyze the files and return valid JSON with this schema:
{
  "title": "File Organization Plan",
  "totalFiles": number,
  "proposals": [
    {
      "id": string,
      "originalName": string,
      "suggestedName": string,
      "category": "Documents" | "Study Materials" | "Work" | "Images" | "Code" | "Spreadsheets" | "Presentations" | "Archives" | "Miscellaneous",
      "destinationFolder": string,
      "explanation": string,
      "confidence": number between 0 and 1,
      "size": number,
      "fileType": string
    }
  ]
}
Destination folder must be a clean relative path (no leading / or ..). No markdown ticks.`;

    const userPrompt = `Organize these files: ${JSON.stringify(files)}`;

    try {
      const rawJson = await this.callOpenAICompatible(systemPrompt, userPrompt);
      const parsed = JSON.parse(rawJson);
      return OrganizerResultSchema.parse({
        ...parsed,
        isDemo: false,
        processedAt: Date.now(),
      });
    } catch (err: unknown) {
      console.warn("Real AI organization failed, falling back to deterministic:", err);
      const fallback = DeterministicAIService.organize(files);
      return { ...fallback, isDemo: true };
    }
  }

  /**
   * Extract Tasks with fallback
   */
  public static async extractTasks(notes: string): Promise<TaskExtractionResult> {
    if (!this.isConfigured()) {
      return DeterministicAIService.extractTasks(notes);
    }

    const systemPrompt = `You are LazyFlow AI's task extraction engine. Convert rough unstructured notes into structured action items. Return valid JSON only:
{
  "title": "Extracted Action Plan",
  "rawNotes": string,
  "tasks": [
    {
      "id": string,
      "title": string,
      "description": string,
      "priority": "High" | "Medium" | "Low",
      "deadline": string or null,
      "isDeadlineInferred": boolean,
      "estimatedDuration": string or null,
      "category": string,
      "dependencies": string[],
      "completed": false
    }
  ]
}`;

    const userPrompt = `Extract action items from these notes:\n${notes.slice(0, 8000)}`;

    try {
      const rawJson = await this.callOpenAICompatible(systemPrompt, userPrompt);
      const parsed = JSON.parse(rawJson);
      return TaskExtractionResultSchema.parse({
        ...parsed,
        rawNotes: notes,
        isDemo: false,
        processedAt: Date.now(),
      });
    } catch (err: unknown) {
      console.warn("Real AI task extraction failed, falling back to deterministic:", err);
      const fallback = DeterministicAIService.extractTasks(notes);
      return { ...fallback, isDemo: true };
    }
  }
}
