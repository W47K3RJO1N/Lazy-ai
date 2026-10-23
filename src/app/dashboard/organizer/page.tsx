"use client";

import React, { useState } from "react";
import {
  FolderTree,
  Upload,
  Check,
  X,
  Copy,
  Sparkles,
  Loader2,
  FolderPlus,
  ShieldCheck,
} from "lucide-react";
import { useJobs } from "@/context/JobContext";
import { OrganizerResult } from "@/types";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  description: string;
}

const SAMPLE_FILES: FileItem[] = [
  { id: "1", name: "Q4_financial_analysis_draft.xlsx", size: 450000, type: "xlsx", description: "Quarterly revenue & expense breakdown" },
  { id: "2", name: "ai_governance_whitepaper_v2.pdf", size: 1200000, type: "pdf", description: "Regulatory compliance draft" },
  { id: "3", name: "hero_banner_homepage_final.png", size: 2400000, type: "png", description: "Product marketing banner" },
  { id: "4", name: "api_client_auth_service.ts", size: 12500, type: "ts", description: "Authentication helper functions" },
  { id: "5", name: "biology_lecture_week3_notes.docx", size: 85000, type: "docx", description: "Cellular respiration and genetics" },
  { id: "6", name: "project_backup_archive_2026.zip", size: 14800000, type: "zip", description: "Old repo snapshot" },
];

export default function SmartOrganizerPage() {
  const { addJob, updateJob } = useJobs();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [result, setResult] = useState<OrganizerResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length === 0) return;

    const newItems: FileItem[] = uploaded.map((f, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      type: f.name.split(".").pop() || "unknown",
      description: "",
    }));

    setFiles((prev) => [...prev, ...newItems]);
    toast.success(`Added ${newItems.length} files to queue`);
  };

  const loadSampleFiles = () => {
    setFiles(SAMPLE_FILES);
    toast.info("Loaded 6 sample files for organization planning");
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateDescription = (id: string, desc: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, description: desc } : f))
    );
  };

  const handleGeneratePlan = async () => {
    if (files.length === 0) {
      toast.error("Please add files before generating an organization plan");
      return;
    }

    setIsPlanning(true);
    const job = addJob({
      title: `File Organization (${files.length} files)`,
      type: "organizer",
      status: "processing",
      inputSummary: `${files.length} files pending structure proposal`,
    });

    try {
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            description: f.description,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to organize files");
      }

      setResult(data);
      updateJob(job.id, {
        status: "completed",
        result: data,
        isDemo: data.isDemo,
      });

      toast.success(
        data.isDemo
          ? "Organization plan generated in Demo Mode"
          : "Organization plan generated successfully"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error planning file structure";
      updateJob(job.id, {
        status: "failed",
        errorMessage: msg,
      });
      toast.error(msg);
    } finally {
      setIsPlanning(false);
    }
  };

  const toggleProposalStatus = (id: string, status: "accepted" | "rejected") => {
    if (!result) return;
    const updated = result.proposals.map((p) => {
      if (p.id === id) {
        const nextStatus: "pending" | "accepted" | "rejected" =
          p.status === status ? "pending" : status;
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setResult({ ...result, proposals: updated });
  };

  const acceptAll = () => {
    if (!result) return;
    setResult({
      ...result,
      proposals: result.proposals.map((p) => ({ ...p, status: "accepted" })),
    });
    toast.success("Accepted all proposed file moves");
  };

  const exportManifest = (format: "json" | "csv") => {
    if (!result) return;

    let content = "";
    let mimeType = "text/plain";

    if (format === "json") {
      content = JSON.stringify(result, null, 2);
      mimeType = "application/json";
    } else {
      content = "Original Name,Suggested Name,Category,Destination Folder,Confidence,Status\n" +
        result.proposals
          .map(
            (p) =>
              `"${p.originalName}","${p.suggestedName}","${p.category}","${p.destinationFolder}",${p.confidence},"${p.status}"`
          )
          .join("\n");
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lazyflow_organization_manifest.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported organization manifest as .${format}`);
  };

  const copyFolderScript = () => {
    if (!result) return;
    const folders = Array.from(new Set(result.proposals.map((p) => p.destinationFolder)));
    const script = `# LazyFlow Organization Folders Script\n` +
      folders.map((f) => `mkdir -p "${f}"`).join("\n") +
      `\n\n# Move commands (Review before running):\n` +
      result.proposals
        .filter((p) => p.status === "accepted")
        .map((p) => `mv "${p.originalName}" "${p.destinationFolder}/${p.suggestedName}"`)
        .join("\n");

    navigator.clipboard.writeText(script);
    toast.success("Folder creation and move script copied to clipboard");
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Smart File Organizer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build a clean organization manifest with safe directory structures and normalized filenames.
          </p>
        </div>
        <button
          onClick={loadSampleFiles}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-muted transition-colors text-sage-800"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Load 6 sample files
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl border bg-sage-50/60 border-sage-200/80 text-xs text-sage-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Safe Browser Boundary Notice:</span> Web browsers cannot silently or arbitrarily move files on your computer. LazyFlow generates a safe, validated organization plan with folder paths and sanitized filenames, allowing you to review each action and export a manifest or migration script.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: File Input & Metadata */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 border border-dashed rounded-xl bg-card hover:bg-muted/10 transition-colors text-center relative">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Add files to organize</p>
              <p className="text-xs text-muted-foreground">Select single or multiple files from your disk</p>
            </div>
          </div>

          <div className="border rounded-xl bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Selected Files ({files.length})</span>
              {files.length > 0 && (
                <button
                  onClick={() => setFiles([])}
                  className="text-red-600 hover:underline text-[11px]"
                >
                  Clear all
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No files queued. Add files above or click &quot;Load 6 sample files&quot;.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 rounded-lg border bg-background text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate max-w-[200px]" title={file.name}>
                        {file.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-red-600 p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Optional notes (e.g. client project, biology lecture)"
                      value={file.description}
                      onChange={(e) => updateDescription(file.id, e.target.value)}
                      className="w-full px-2 py-1 text-[11px] rounded border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isPlanning || files.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPlanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Organization Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Organization Plan
              </>
            )}
          </button>
        </div>

        {/* Right: Organization Plan Table & Actions */}
        <div className="lg:col-span-7">
          <div className="border rounded-2xl bg-card p-5 space-y-4 shadow-subtle min-h-[460px] flex flex-col justify-between">
            {result ? (
              <div className="space-y-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{result.title}</h3>
                      {result.isDemo && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                          Demo Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {result.proposals.length} proposed destinations. Review and accept changes.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={acceptAll}
                      className="px-2.5 py-1.5 rounded-lg border bg-sage-50 text-sage-800 text-xs font-medium hover:bg-sage-100 transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() => exportManifest("json")}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground text-xs"
                      title="Export JSON manifest"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => exportManifest("csv")}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground text-xs"
                      title="Export CSV manifest"
                    >
                      CSV
                    </button>
                    <button
                      onClick={copyFolderScript}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground text-xs"
                      title="Copy bash migration script"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Proposals list */}
                <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                  {result.proposals.map((prop) => (
                    <div
                      key={prop.id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        prop.status === "accepted"
                          ? "bg-emerald-50/50 border-emerald-300"
                          : prop.status === "rejected"
                          ? "bg-red-50/30 border-red-200 opacity-60"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="text-muted-foreground line-through font-normal">
                              {prop.originalName}
                            </span>
                            <span>→</span>
                            <span className="text-sage-800">{prop.suggestedName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="bg-muted px-2 py-0.5 rounded font-medium">
                              📁 {prop.destinationFolder}
                            </span>
                            <span className="bg-sage-100 text-sage-800 px-1.5 py-0.5 rounded">
                              {prop.category}
                            </span>
                            <span>Confidence: {Math.round(prop.confidence * 100)}%</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground pt-0.5">
                            {prop.explanation}
                          </p>
                        </div>

                        {/* Accept / Reject actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleProposalStatus(prop.id, "accepted")}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              prop.status === "accepted"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "hover:bg-emerald-50 text-emerald-700"
                            }`}
                            title="Accept proposal"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleProposalStatus(prop.id, "rejected")}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              prop.status === "rejected"
                                ? "bg-red-600 text-white border-red-600"
                                : "hover:bg-red-50 text-red-700"
                            }`}
                            title="Reject proposal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                  <FolderTree className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-foreground">No Organization Plan Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Select files or load sample files on the left, then click &quot;Generate Organization Plan&quot; to inspect recommended destination folders and standardized filenames.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
