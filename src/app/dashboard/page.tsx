"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  FolderTree,
  ListTodo,
  ArrowRight,
  RotateCw,
  XCircle,
  Trash2,
  Eye,
  Info,
} from "lucide-react";
import { useJobs } from "@/context/JobContext";
import { AIStatusIndicator } from "@/components/AIStatusIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { AutomationJob } from "@/types";
import { toast } from "sonner";

export default function DashboardOverviewPage() {
  const { jobs, stats, retryJob, cancelJob, removeJob } = useJobs();
  const [selectedJob, setSelectedJob] = useState<AutomationJob | null>(null);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      removeJob(id);
      toast.success("Job removed from local storage");
      if (selectedJob?.id === id) setSelectedJob(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What can we take off your plate?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personal automation workspace. Review proposals, manage jobs, and reclaim your time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIStatusIndicator showDetails />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-card shadow-subtle flex flex-col justify-between">
          <div className="text-xs font-medium text-muted-foreground">Total Automation Jobs</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.total}</span>
            <span className="text-xs text-muted-foreground">in local queue</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card shadow-subtle flex flex-col justify-between">
          <div className="text-xs font-medium text-muted-foreground">Completed Tasks</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">{stats.completed}</span>
            <span className="text-xs text-emerald-700/80 font-medium">processed successfully</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card shadow-subtle flex flex-col justify-between">
          <div className="text-xs font-medium text-muted-foreground">Pending Review</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{stats.pending + stats.processing}</span>
            <span className="text-xs text-amber-600/80 font-medium">ready or running</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Estimated Time Saved</span>
            <div title="Derived from transparent baseline: ~15m per document summary, ~10m per file organization plan, ~12m per notes-to-task plan.">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sage-800">
              {stats.estimatedMinutesSaved >= 60
                ? `${(stats.estimatedMinutesSaved / 60).toFixed(1)} hrs`
                : `${stats.estimatedMinutesSaved} mins`}
            </span>
            <span className="text-xs text-muted-foreground">(est. savings)</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/summarizer"
            className="group p-5 rounded-xl border bg-card hover:border-sage-400 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-sage-800 transition-colors">
                Summarize a document
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Turn long documents, articles, and research PDFs into clear, useful takeaways.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
              <span>Open tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/organizer"
            className="group p-5 rounded-xl border bg-card hover:border-sage-400 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-sage-800 transition-colors">
                Organize files
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Create a cleaner folder structure with sanitized names and safe manifest exports.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
              <span>Open tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/tasks"
            className="group p-5 rounded-xl border bg-card hover:border-sage-400 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-sage-800 transition-colors">
                Extract tasks
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Turn rough notes into a prioritized action plan with inferred deadlines.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
              <span>Open tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Central Automation Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">Automation Queue</h2>
            <p className="text-xs text-muted-foreground">
              Browser-local active session queue. Jobs are preserved in local storage.
            </p>
          </div>
          <Link
            href="/dashboard/history"
            className="text-xs font-medium text-sage-700 hover:underline flex items-center gap-1"
          >
            View all history <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="border rounded-xl bg-card shadow-subtle overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No jobs currently in your queue.</p>
              <p className="text-xs text-muted-foreground">
                Select one of the tools above or try a sample workflow.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                    <th className="py-3 px-4">Job Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.slice(0, 8).map((job) => (
                    <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-medium max-w-[240px] truncate">
                        <div className="flex items-center gap-2">
                          <span title={job.title}>{job.title}</span>
                          {job.isDemo && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-normal">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{job.inputSummary}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-xs text-muted-foreground">
                        {job.type}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {job.result && (
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
                              title="View Result"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {job.status === "failed" && (
                            <button
                              onClick={() => retryJob(job.id)}
                              className="p-1.5 rounded-lg hover:bg-muted text-sage-700 transition-colors"
                              title="Retry Job"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                          )}
                          {job.status === "pending" && (
                            <button
                              onClick={() => cancelJob(job.id)}
                              className="p-1.5 rounded-lg hover:bg-muted text-amber-700 transition-colors"
                              title="Cancel Job"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(job.id, job.title)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal / Drawer preview */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-elevated">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">{selectedJob.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedJob.type} • Processed at {formatDate(selectedJob.updatedAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
              {selectedJob.isDemo && (
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200">
                  This result was generated using LazyFlow&apos;s deterministic local demo logic.
                </div>
              )}

              <pre className="p-3 bg-muted rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedJob.result, null, 2)}
              </pre>
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
