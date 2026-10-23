import { sanitizeFilename, sanitizeFolderPath } from "@/lib/sanitize";
import { DeterministicAIService } from "@/lib/deterministic-ai";
import { TaskExtractionResultSchema } from "@/types";

describe("LazyFlow AI Core Logic Tests", () => {
  describe("Security & Sanitization", () => {
    test("sanitizeFilename removes path traversal and invalid characters", () => {
      expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
      expect(sanitizeFilename("..\\..\\windows\\system32\\cmd.exe")).toBe("cmd.exe");
      expect(sanitizeFilename("q4:draft?.pdf")).toBe("q4_draft_.pdf");
      expect(sanitizeFilename("")).toBe("unnamed_file");
    });

    test("sanitizeFolderPath disallows parent navigation and cleans slashes", () => {
      expect(sanitizeFolderPath("../../confidential/docs")).toBe("confidential/docs");
      expect(sanitizeFolderPath("///Work//Projects///")).toBe("Work/Projects");
      expect(sanitizeFolderPath("")).toBe("Organized");
    });
  });

  describe("Deterministic Fallback Processing", () => {
    test("summarize produces structured output with key takeaways", () => {
      const sampleText =
        "Open-weight models provide high energy efficiency. Organizations can reduce inference overhead by 40%. It is critical to benchmark performance and establish automated evaluations. Therefore, adoption should accelerate.";
      const res = DeterministicAIService.summarize(sampleText, "Test Document", "detailed");

      expect(res.title).toBe("Test Document");
      expect(res.overview).toBeDefined();
      expect(res.keyPoints.length).toBeGreaterThan(0);
      expect(res.isDemo).toBe(true);
    });

    test("extractTasks transforms raw notes into valid task objects", () => {
      const notes =
        "Finish the project report by Friday, email the professor regarding assignment, and review slides.";
      const res = DeterministicAIService.extractTasks(notes);

      expect(res.tasks.length).toBeGreaterThanOrEqual(2);
      expect(res.tasks[0].title).toBeDefined();
      expect(["High", "Medium", "Low"]).toContain(res.tasks[0].priority);

      // Validate against Zod schema
      const validated = TaskExtractionResultSchema.safeParse(res);
      expect(validated.success).toBe(true);
    });

    test("organize plans safe categories and destination folders", () => {
      const files = [
        { name: "biology_lecture_slides.pdf", size: 1024, type: "pdf" },
        { name: "financial_report.xlsx", size: 2048, type: "xlsx" },
      ];
      const res = DeterministicAIService.organize(files);

      expect(res.proposals.length).toBe(2);
      expect(res.proposals[0].destinationFolder).toBe("Academics/Study_Notes");
      expect(res.proposals[1].category).toBe("Spreadsheets");
      expect(res.proposals[1].destinationFolder).toBe("Data/Spreadsheets");
    });
  });
});
