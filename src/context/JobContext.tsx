"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AutomationJob, JobStatus } from "@/types";

interface JobContextType {
  jobs: AutomationJob[];
  addJob: (job: Omit<AutomationJob, "id" | "createdAt" | "updatedAt">) => AutomationJob;
  updateJob: (id: string, updates: Partial<AutomationJob>) => void;
  removeJob: (id: string) => void;
  clearAllJobs: () => void;
  retryJob: (id: string) => Promise<void>;
  cancelJob: (id: string) => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    failed: number;
    estimatedMinutesSaved: number;
  };
}

const STORAGE_KEY = "lazyflow_automation_jobs_v1";

const SEED_JOBS: AutomationJob[] = [
  {
    id: "seed-job-1",
    title: "AI Ethics & Open-Weight Research Paper",
    type: "summarizer",
    status: "completed",
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2 + 12000,
    inputSummary: "Academic PDF: 24 pages, 38,400 chars",
    isDemo: true,
    result: {
      title: "AI Ethics & Open-Weight Research Paper",
      style: "study",
      overview:
        "Comprehensive analysis of open-weight LLMs, decentralized inference viability, energy consumption patterns, and governance models in 2026.",
      keyPoints: [
        "Open-weight architectures like Qwen and Gemma achieve competitive accuracy with 40% lower operational overhead.",
        "On-premise deployment eliminates vendor lock-in and mitigates data sovereignty risks.",
        "Fine-tuning quantized checkpoints reduces training energy expenditure by up to 60%.",
        "Transparent model weights enable community safety audits and custom alignment rules.",
      ],
      importantConcepts: ["Decentralized Inference", "Model Quantization", "Data Sovereignty", "Green AI"],
      actionItems: [
        "Benchmark Qwen 2.5 72B against current proprietary API workloads.",
        "Draft a local inference security policy for internal document processing.",
      ],
      originalCharCount: 38400,
      summaryCharCount: 820,
      isDemo: true,
      processedAt: Date.now() - 3600000 * 2 + 12000,
    },
  },
  {
    id: "seed-job-2",
    title: "Sprint Planning & Q4 Product Sync",
    type: "tasks",
    status: "completed",
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5 + 4000,
    inputSummary: "Unstructured meeting notes: 4 items detected",
    isDemo: true,
    result: {
      title: "Extracted Action Plan",
      rawNotes: "Ship v1.2 release by Friday. Review open PRs for memory leaks. Schedule client demo on Monday.",
      tasks: [
        {
          id: "task-seed-1",
          title: "Ship v1.2 release build",
          description: "Prepare and deploy final production artifacts for the sprint.",
          priority: "High",
          deadline: "Next Friday",
          isDeadlineInferred: false,
          estimatedDuration: "2 hours",
          category: "Work",
          dependencies: [],
          completed: false,
        },
        {
          id: "task-seed-2",
          title: "Review open pull requests for memory leaks",
          description: "Perform code review focusing on cleanup of unclosed buffer streams.",
          priority: "Medium",
          deadline: "End of Week",
          isDeadlineInferred: true,
          estimatedDuration: "1 hour",
          category: "Work",
          dependencies: [],
          completed: true,
        },
        {
          id: "task-seed-3",
          title: "Schedule client product demo",
          description: "Send calendar invite with agenda and live preview credentials.",
          priority: "Medium",
          deadline: "Next Monday",
          isDeadlineInferred: false,
          estimatedDuration: "20 mins",
          category: "Communication",
          dependencies: [],
          completed: false,
        },
      ],
      isDemo: true,
      processedAt: Date.now() - 3600000 * 5 + 4000,
    },
  },
  {
    id: "seed-job-3",
    title: "Downloads & Work Assets Cleanup",
    type: "organizer",
    status: "pending",
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 8,
    inputSummary: "6 mixed assets pending review",
    isDemo: true,
    result: {
      title: "File Organization Plan",
      totalFiles: 6,
      proposals: [
        {
          id: "p1",
          originalName: "financial_forecast_2026.xlsx",
          suggestedName: "sheet_financial_forecast_2026.xlsx",
          category: "Spreadsheets",
          destinationFolder: "Data/Spreadsheets",
          explanation: "Tabular financial modeling sheet.",
          confidence: 0.94,
          size: 428000,
          fileType: "xlsx",
          status: "pending",
        },
        {
          id: "p2",
          originalName: "system_architecture_diagram.png",
          suggestedName: "img_system_architecture_diagram.png",
          category: "Images",
          destinationFolder: "Media/Images",
          explanation: "High resolution diagram image.",
          confidence: 0.95,
          size: 1240000,
          fileType: "png",
          status: "pending",
        },
        {
          id: "p3",
          originalName: "client_onboarding_guide.pdf",
          suggestedName: "doc_client_onboarding_guide.pdf",
          category: "Work",
          destinationFolder: "Work/Client_Projects",
          explanation: "Document related to client operations.",
          confidence: 0.92,
          size: 890000,
          fileType: "pdf",
          status: "pending",
        },
      ],
      isDemo: true,
      processedAt: Date.now() - 3600000 * 8,
    },
  },
];

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Recover any job that was left in 'processing' when the window closed
          const recovered = parsed.map((job: AutomationJob) => {
            if (job.status === "processing") {
              return {
                ...job,
                status: "failed" as JobStatus,
                errorMessage: "Job was interrupted before completion (e.g. browser reload).",
                updatedAt: Date.now(),
              };
            }
            return job;
          });
          setJobs(recovered);
        } else {
          setJobs(SEED_JOBS);
        }
      } else {
        setJobs(SEED_JOBS);
      }
    } catch (e) {
      console.error("Failed to parse stored jobs, resetting to seeds", e);
      setJobs(SEED_JOBS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error("Failed to persist jobs to localStorage", e);
    }
  }, [jobs, isLoaded]);

  const addJob = (jobInput: Omit<AutomationJob, "id" | "createdAt" | "updatedAt">): AutomationJob => {
    const newJob: AutomationJob = {
      ...jobInput,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<AutomationJob>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates, updatedAt: Date.now() } : job))
    );
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const clearAllJobs = () => {
    setJobs([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const cancelJob = (id: string) => {
    updateJob(id, {
      status: "cancelled",
      errorMessage: "Manually cancelled by user.",
    });
  };

  const retryJob = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    updateJob(id, {
      status: "processing",
      errorMessage: undefined,
    });

    // In a real retry, trigger the appropriate endpoint or simulate re-execution
    setTimeout(() => {
      updateJob(id, {
        status: "completed",
        updatedAt: Date.now(),
      });
    }, 1500);
  };

  // Calculated stats (with explicit assumptions)
  // Assumptions: Document summary ~15 mins saved, File Organizer ~10 mins saved, Task Extraction ~12 mins saved
  const stats = React.useMemo(() => {
    let completed = 0;
    let pending = 0;
    let processing = 0;
    let failed = 0;
    let estimatedMinutesSaved = 0;

    jobs.forEach((j) => {
      if (j.status === "completed") {
        completed++;
        if (j.type === "summarizer") estimatedMinutesSaved += 15;
        else if (j.type === "organizer") estimatedMinutesSaved += 10;
        else if (j.type === "tasks") estimatedMinutesSaved += 12;
      } else if (j.status === "pending") {
        pending++;
      } else if (j.status === "processing") {
        processing++;
      } else if (j.status === "failed") {
        failed++;
      }
    });

    return {
      total: jobs.length,
      completed,
      pending,
      processing,
      failed,
      estimatedMinutesSaved,
    };
  }, [jobs]);

  return (
    <JobContext.Provider
      value={{
        jobs,
        addJob,
        updateJob,
        removeJob,
        clearAllJobs,
        retryJob,
        cancelJob,
        stats,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
}
