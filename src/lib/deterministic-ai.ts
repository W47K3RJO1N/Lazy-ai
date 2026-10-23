import {
  SummaryResult,
  OrganizerResult,
  TaskExtractionResult,
  SummaryStyle,
  FileCategory,
  TaskPriority,
} from "@/types";
import { sanitizeFilename, sanitizeFolderPath } from "./sanitize";

export class DeterministicAIService {
  /**
   * Deterministic Document Summarization
   */
  static summarize(text: string, title: string, style: SummaryStyle): SummaryResult {
    const cleanText = text.trim();
    const originalCharCount = cleanText.length;

    // Extract sentences
    const sentences = cleanText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    const firstSentences = sentences.slice(0, 3).join(" ");
    const keyPoints: string[] = [];
    const concepts: string[] = [];
    const actionItems: string[] = [];

    // Extract candidates for key points and action items
    sentences.forEach((s) => {
      const lower = s.toLowerCase();
      if (
        (lower.includes("must") ||
          lower.includes("need to") ||
          lower.includes("should") ||
          lower.includes("action") ||
          lower.includes("deadline") ||
          lower.includes("todo") ||
          lower.includes("ensure")) &&
        actionItems.length < 5
      ) {
        actionItems.push(s);
      } else if (
        (lower.includes("important") ||
          lower.includes("key") ||
          lower.includes("result") ||
          lower.includes("primary") ||
          lower.includes("therefore") ||
          lower.includes("conclude")) &&
        keyPoints.length < 5
      ) {
        keyPoints.push(s);
      }
    });

    // Fill key points if scarce
    if (keyPoints.length === 0) {
      for (let i = 0; i < Math.min(4, sentences.length); i++) {
        keyPoints.push(sentences[i]);
      }
    }

    if (actionItems.length === 0) {
      actionItems.push(
        "Review initial findings and verify requirements against project goals.",
        "Synthesize takeaways with the team to prioritize next development steps."
      );
    }

    // Identify conceptual keywords
    const words = cleanText.split(/\W+/).filter((w) => w.length > 5);
    const wordCounts: Record<string, number> = {};
    for (const w of words) {
      const lower = w.toLowerCase();
      if (
        !["because", "between", "through", "should", "without", "however", "before", "against"].includes(
          lower
        )
      ) {
        wordCounts[lower] = (wordCounts[lower] || 0) + 1;
      }
    }
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    concepts.push(...sortedWords);

    let overview = "";
    switch (style) {
      case "quick":
        overview = firstSentences || "A concise high-level overview of the provided material.";
        break;
      case "executive":
        overview = `Executive Briefing: ${firstSentences}. This document outlines primary objectives, operational considerations, and key milestones required for decision-making.`;
        break;
      case "study":
        overview = `Comprehensive Study Synthesis: ${firstSentences}. Focused on core theoretical definitions, systematic breakdowns, and exam/revision highlights.`;
        break;
      case "action_items":
        overview = `Actionable Breakdown: ${firstSentences}. Directly targeted towards executable outcomes, assigned items, and sequence of work.`;
        break;
      default:
        overview = firstSentences || "A balanced, detailed analysis of the provided text.";
        break;
    }

    const summaryTotalText =
      overview + keyPoints.join(" ") + concepts.join(" ") + actionItems.join(" ");

    return {
      title: title || "Document Summary",
      style,
      overview,
      keyPoints,
      importantConcepts: concepts.length > 0 ? concepts : ["System Architecture", "Optimization", "Productivity"],
      actionItems,
      originalCharCount,
      summaryCharCount: summaryTotalText.length,
      isDemo: true,
      processedAt: Date.now(),
    };
  }

  /**
   * Deterministic File Organization Planner
   */
  static organize(
    files: Array<{ name: string; size: number; type?: string; description?: string }>
  ): OrganizerResult {
    const proposals = files.map((file, idx) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const cleanBase = sanitizeFilename(baseName).toLowerCase().replace(/[\s_-]+/g, "_");

      let category: FileCategory = "Miscellaneous";
      let folder = "Misc";
      let suggestedName = `${cleanBase}.${ext}`;
      let explanation = "Categorized based on file extension and metadata.";
      let confidence = 0.85;

      if (["pdf", "docx", "doc", "txt", "rtf", "odt"].includes(ext)) {
        if (
          cleanBase.includes("lecture") ||
          cleanBase.includes("syllabus") ||
          cleanBase.includes("exam") ||
          cleanBase.includes("study") ||
          cleanBase.includes("notes")
        ) {
          category = "Study Materials";
          folder = "Academics/Study_Notes";
          explanation = "Detected academic and study document keywords.";
          suggestedName = `notes_${cleanBase}.${ext}`;
          confidence = 0.95;
        } else if (
          cleanBase.includes("contract") ||
          cleanBase.includes("invoice") ||
          cleanBase.includes("proposal") ||
          cleanBase.includes("report") ||
          cleanBase.includes("meeting")
        ) {
          category = "Work";
          folder = "Work/Business_Docs";
          explanation = "Detected professional documentation pattern.";
          suggestedName = `doc_${cleanBase}.${ext}`;
          confidence = 0.92;
        } else {
          category = "Documents";
          folder = "Documents/General";
          suggestedName = `doc_${cleanBase}.${ext}`;
          explanation = "Standard text document format.";
          confidence = 0.88;
        }
      } else if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) {
        category = "Images";
        folder = "Media/Images";
        suggestedName = `img_${cleanBase}.${ext}`;
        explanation = "Graphic media asset.";
        confidence = 0.95;
      } else if (["js", "ts", "tsx", "py", "go", "rs", "json", "yaml", "html", "css"].includes(ext)) {
        category = "Code";
        folder = "Development/Sources";
        suggestedName = `${cleanBase}.${ext}`;
        explanation = "Source code or configuration asset.";
        confidence = 0.96;
      } else if (["xlsx", "xls", "csv"].includes(ext)) {
        category = "Spreadsheets";
        folder = "Data/Spreadsheets";
        suggestedName = `sheet_${cleanBase}.${ext}`;
        explanation = "Tabular data file.";
        confidence = 0.94;
      } else if (["pptx", "key", "ppt"].includes(ext)) {
        category = "Presentations";
        folder = "Presentations";
        suggestedName = `slides_${cleanBase}.${ext}`;
        explanation = "Slide presentation deck.";
        confidence = 0.93;
      } else if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) {
        category = "Archives";
        folder = "Archives/Compressed";
        suggestedName = `archive_${cleanBase}.${ext}`;
        explanation = "Compressed archive package.";
        confidence = 0.92;
      }

      // Check description keywords
      if (file.description) {
        const descLower = file.description.toLowerCase();
        if (descLower.includes("client") || descLower.includes("project")) {
          category = "Work";
          folder = "Work/Client_Projects";
          explanation = "User description highlighted project context.";
        }
      }

      return {
        id: `prop-${idx}-${Date.now()}`,
        originalName: file.name,
        suggestedName: sanitizeFilename(suggestedName),
        category,
        destinationFolder: sanitizeFolderPath(folder),
        explanation,
        confidence,
        size: file.size,
        fileType: file.type || ext || "unknown",
        status: "pending" as const,
      };
    });

    return {
      title: "File Organization Plan",
      totalFiles: files.length,
      proposals,
      isDemo: true,
      processedAt: Date.now(),
    };
  }

  /**
   * Deterministic Notes to Tasks Extractor
   */
  static extractTasks(notes: string): TaskExtractionResult {
    const rawNotes = notes.trim();
    // Split on commas, periods, semicolons, bullet points, or newlines
    const rawItems = rawNotes
      .split(/(?:\r?\n|;|\band\b|•|-|\*)/)
      .map((i) => i.trim())
      .filter((i) => i.length > 5);

    const tasks = rawItems.map((item, idx) => {
      const lower = item.toLowerCase();
      let priority: TaskPriority = "Medium";
      let deadline: string | null = null;
      let isDeadlineInferred = false;
      let estimatedDuration: string | null = null;
      let category = "General";

      // Detect Priority
      if (
        lower.includes("urgent") ||
        lower.includes("asap") ||
        lower.includes("critical") ||
        lower.includes("finish") ||
        lower.includes("immediately")
      ) {
        priority = "High";
      } else if (
        lower.includes("maybe") ||
        lower.includes("consider") ||
        lower.includes("later") ||
        lower.includes("sometime")
      ) {
        priority = "Low";
      }

      // Detect Deadlines
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      for (const day of days) {
        if (lower.includes(day)) {
          deadline = `Next ${day.charAt(0).toUpperCase() + day.slice(1)}`;
          isDeadlineInferred = false;
          break;
        }
      }
      if (!deadline) {
        if (lower.includes("tomorrow")) {
          deadline = "Tomorrow";
        } else if (lower.includes("end of week") || lower.includes("eow")) {
          deadline = "End of Week";
        } else if (lower.includes("today")) {
          deadline = "Today";
        }
      }

      // Detect Duration
      if (lower.includes("quick") || lower.includes("email") || lower.includes("call")) {
        estimatedDuration = "15-30 mins";
      } else if (lower.includes("report") || lower.includes("slides") || lower.includes("review")) {
        estimatedDuration = "1-2 hours";
      } else if (lower.includes("project") || lower.includes("design") || lower.includes("build")) {
        estimatedDuration = "3-4 hours";
      }

      // Detect Category
      if (lower.includes("email") || lower.includes("call") || lower.includes("slack") || lower.includes("sync")) {
        category = "Communication";
      } else if (lower.includes("study") || lower.includes("chapter") || lower.includes("professor") || lower.includes("exam")) {
        category = "Academics";
      } else if (lower.includes("client") || lower.includes("report") || lower.includes("slides") || lower.includes("presentation")) {
        category = "Work";
      } else if (lower.includes("buy") || lower.includes("order") || lower.includes("clean")) {
        category = "Personal";
      }

      // Clean Title
      let cleanTitle = item.replace(/^(please|remember to|need to|must|have to)\s+/i, "");
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      return {
        id: `task-${idx}-${Date.now()}`,
        title: cleanTitle,
        description: `Extracted from note snippet: "${item}"`,
        priority,
        deadline,
        isDeadlineInferred,
        estimatedDuration,
        category,
        dependencies: [],
        completed: false,
      };
    });

    return {
      title: "Extracted Action Plan",
      rawNotes,
      tasks: tasks.length > 0 ? tasks : [
        {
          id: `task-default-${Date.now()}`,
          title: "Review entered notes and specify key outcomes",
          description: "Created automatically as a default starting task.",
          priority: "Medium",
          deadline: "End of Week",
          isDeadlineInferred: true,
          estimatedDuration: "20 mins",
          category: "Planning",
          dependencies: [],
          completed: false,
        }
      ],
      isDemo: true,
      processedAt: Date.now(),
    };
  }
}
