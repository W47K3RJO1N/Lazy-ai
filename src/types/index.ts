import { z } from "zod";

// Job Types
export type JobType = "summarizer" | "organizer" | "tasks";
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

// Summarizer Types
export type SummaryStyle =
  | "quick"
  | "detailed"
  | "study"
  | "executive"
  | "action_items";

export const SummaryResultSchema = z.object({
  title: z.string(),
  style: z.string(),
  overview: z.string(),
  keyPoints: z.array(z.string()),
  importantConcepts: z.array(z.string()).default([]),
  actionItems: z.array(z.string()).default([]),
  originalCharCount: z.number(),
  summaryCharCount: z.number(),
  isDemo: z.boolean().default(false),
  processedAt: z.number().default(() => Date.now()),
});

export type SummaryResult = z.infer<typeof SummaryResultSchema>;

// Smart File Organizer Types
export const FileCategorySchema = z.enum([
  "Documents",
  "Study Materials",
  "Work",
  "Images",
  "Code",
  "Spreadsheets",
  "Presentations",
  "Archives",
  "Miscellaneous",
]);

export type FileCategory = z.infer<typeof FileCategorySchema>;

export const FileProposalSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  suggestedName: z.string(),
  category: FileCategorySchema,
  destinationFolder: z.string(),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  size: z.number(),
  fileType: z.string(),
  status: z.enum(["accepted", "rejected", "pending"]).default("pending"),
});

export type FileProposal = z.infer<typeof FileProposalSchema>;

export const OrganizerResultSchema = z.object({
  title: z.string(),
  totalFiles: z.number(),
  proposals: z.array(FileProposalSchema),
  isDemo: z.boolean().default(false),
  processedAt: z.number().default(() => Date.now()),
});

export type OrganizerResult = z.infer<typeof OrganizerResultSchema>;

// Task Extractor Types
export const TaskPrioritySchema = z.enum(["High", "Medium", "Low"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const ExtractedTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  priority: TaskPrioritySchema,
  deadline: z.string().nullable().optional(),
  isDeadlineInferred: z.boolean().default(false),
  estimatedDuration: z.string().nullable().optional(),
  category: z.string().default("General"),
  dependencies: z.array(z.string()).default([]),
  completed: z.boolean().default(false),
});

export type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;

export const TaskExtractionResultSchema = z.object({
  title: z.string(),
  rawNotes: z.string(),
  tasks: z.array(ExtractedTaskSchema),
  isDemo: z.boolean().default(false),
  processedAt: z.number().default(() => Date.now()),
});

export type TaskExtractionResult = z.infer<typeof TaskExtractionResultSchema>;

// General Automation Job Model
export interface AutomationJob {
  id: string;
  title: string;
  type: JobType;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  inputSummary: string;
  result?: SummaryResult | OrganizerResult | TaskExtractionResult;
  errorMessage?: string;
  isDemo?: boolean;
}

// AI Config Status
export interface AIStatusResponse {
  configured: boolean;
  model: string;
  baseUrl: string;
  mode: "real" | "demo";
}
