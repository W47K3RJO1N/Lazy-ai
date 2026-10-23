"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Copy,
  Download,
  Sparkles,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react";
import { SummaryStyle, SummaryResult } from "@/types";
import { useJobs } from "@/context/JobContext";
import { toast } from "sonner";

const STYLES: { id: SummaryStyle; label: string; desc: string }[] = [
  { id: "quick", label: "Quick Overview", desc: "Short, punchy 2-3 sentence digest" },
  { id: "detailed", label: "Detailed Summary", desc: "Comprehensive breakdown with all key points" },
  { id: "study", label: "Study Notes", desc: "Structured highlights for exams & revision" },
  { id: "executive", label: "Executive Brief", desc: "Decisions, trade-offs, and operational impact" },
  { id: "action_items", label: "Action Items", desc: "Directly executable takeaways & next steps" },
];

const SAMPLE_TEXT = `Decentralized AI inference using open-weight models represents a fundamental architectural shift for modern organizations. By hosting models like Qwen 2.5 and Gemma on localized infrastructure or privacy-first edge nodes, enterprises eliminate reliance on centralized proprietary API endpoints.

This mitigates data privacy leakage, complies with strict data residency laws such as GDPR, and ensures predictable operational costs. Furthermore, smaller quantized checkpoints (such as 4-bit and 8-bit quantized variants) allow execution on cost-effective workstation hardware with minimal degradation in practical reasoning tasks.

To successfully implement this transition, engineering teams must benchmark their latency requirements, establish rigorous automated validation pipelines, and audit system prompt boundaries. Next steps include running local containerized deployments on test clusters, evaluating memory bandwidth bottlenecks, and reporting baseline energy consumption.`;

export default function DocumentSummarizerPage() {
  const { addJob, updateJob } = useJobs();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [style, setStyle] = useState<SummaryStyle>("detailed");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setIsExtractingPdf(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to extract text from PDF");
        }

        setText(data.text);
        if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
        toast.success(`Extracted ${data.charCount.toLocaleString()} characters from ${file.name}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error parsing PDF";
        toast.error(msg);
      } finally {
        setIsExtractingPdf(false);
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      toast.error("Unsupported file type. Please upload a PDF or plain text file.");
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error("Please enter or upload document text to summarize");
      return;
    }

    setIsSummarizing(true);
    const docTitle = title.trim() || "Untitled Document";

    // Create session job
    const job = addJob({
      title: docTitle,
      type: "summarizer",
      status: "processing",
      inputSummary: `${text.length.toLocaleString()} characters • ${style}`,
    });

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          title: docTitle,
          style,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Summarization failed");
      }

      setResult(data);
      updateJob(job.id, {
        status: "completed",
        result: data,
        isDemo: data.isDemo,
      });

      toast.success(
        data.isDemo ? "Generated simulated summary in Demo Mode" : "Summary generated successfully"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to summarize";
      updateJob(job.id, {
        status: "failed",
        errorMessage: msg,
      });
      toast.error(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const content = `${result.title}\n\nOverview:\n${result.overview}\n\nKey Points:\n${result.keyPoints
      .map((p) => `• ${p}`)
      .join("\n")}\n\nAction Items:\n${result.actionItems.map((a) => `• ${a}`).join("\n")}`;

    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = (ext: "txt" | "md") => {
    if (!result) return;
    let content = "";
    if (ext === "md") {
      content = `# ${result.title}\n\n*Summary Style: ${result.style}*\n\n## Overview\n${result.overview}\n\n## Key Points\n${result.keyPoints.map((k) => `- ${k}`).join("\n")}\n\n## Important Concepts\n${result.importantConcepts.map((c) => `- **${c}**`).join("\n")}\n\n## Action Items\n${result.actionItems.map((a) => `- [ ] ${a}`).join("\n")}\n\n---\n*Generated by LazyFlow AI*`;
    } else {
      content = `${result.title}\nStyle: ${result.style}\n\nOVERVIEW:\n${result.overview}\n\nKEY POINTS:\n${result.keyPoints.map((k) => `* ${k}`).join("\n")}\n\nACTION ITEMS:\n${result.actionItems.map((a) => `[ ] ${a}`).join("\n")}`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.toLowerCase().replace(/\s+/g, "_")}_summary.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded summary as .${ext}`);
  };

  const loadSample = () => {
    setTitle("Decentralized Open-Weight AI Architecture");
    setText(SAMPLE_TEXT);
    setStyle("detailed");
    toast.info("Sample research document loaded");
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Document Summarizer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Turn lengthy PDFs, whitepapers, and documents into clear, digestible takeaways.
          </p>
        </div>
        <button
          onClick={loadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-muted transition-colors text-sage-800"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Load sample text
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* File Upload Zone */}
          <div className="p-5 border border-dashed rounded-xl bg-card hover:bg-muted/10 transition-colors text-center relative">
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              disabled={isExtractingPdf}
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center">
                {isExtractingPdf ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isExtractingPdf ? "Extracting text from PDF..." : "Upload a PDF or text file"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drag and drop, or click to browse (.pdf, .txt, .md max 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Decentralized Open-Weight AI Architecture"
              className="w-full px-3.5 py-2 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Summary Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    style === s.id
                      ? "border-primary bg-sage-50/70 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="text-xs font-semibold text-foreground">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Document Content Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-foreground">
                Document Text
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {text.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste raw article, lecture notes, or document text here..."
              className="w-full p-3.5 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none font-mono text-xs leading-relaxed"
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !text.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Summarize Document
              </>
            )}
          </button>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-6">
          <div className="h-full border rounded-2xl bg-card p-6 flex flex-col justify-between shadow-subtle min-h-[460px]">
            {result ? (
              <div className="space-y-6 flex-1">
                <div className="flex items-start justify-between pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-foreground">{result.title}</h3>
                      {result.isDemo && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                          Demo Mode Output
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      Style: {result.style} • Reduced from {result.originalCharCount.toLocaleString()} to{" "}
                      {result.summaryCharCount.toLocaleString()} chars
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg border hover:bg-muted text-muted-foreground"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => downloadSummary("md")}
                      className="p-2 rounded-lg border hover:bg-muted text-muted-foreground"
                      title="Download Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Overview
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-xl border">
                    {result.overview}
                  </p>
                </div>

                {/* Key Points */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concepts */}
                {result.importantConcepts?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Core Concepts
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.importantConcepts.map((concept, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-xs bg-sage-100 text-sage-800 font-medium"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {result.actionItems?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Recommended Action Items
                    </h4>
                    <ul className="space-y-2">
                      {result.actionItems.map((item, i) => (
                        <li key={i} className="text-xs flex items-start gap-2 text-foreground">
                          <Check className="w-3.5 h-3.5 text-sage-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-foreground">No Summary Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Upload a PDF or paste text on the left, then click &quot;Summarize Document&quot;. Results will be saved automatically to your activity history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
