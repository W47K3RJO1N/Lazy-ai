"use client";

import React, { useState } from "react";
import {
  Search,
  Trash2,
  RotateCw,
  Eye,
  Download,
} from "lucide-react";
import { useJobs } from "@/context/JobContext";
import { AutomationJob } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function HistoryPage() {
  const { jobs, removeJob, clearAllJobs, retryJob } = useJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<AutomationJob | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.inputSummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all automation history? This cannot be undone.")) {
      clearAllJobs();
      toast.success("History cleared");
    }
  };

  const handleExportSelected = () => {
    const dataStr = JSON.stringify(filteredJobs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lazyflow_history_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredJobs.length} history records`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Activity History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browser-local persistent log of all completed, pending, and simulated automation jobs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {jobs.length > 0 && (
            <>
              <button
                onClick={handleExportSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by job title or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border bg-card text-foreground focus:outline-none"
          >
            <option value="all">All Tool Types</option>
            <option value="summarizer">Document Summarizer</option>
            <option value="organizer">Smart Organizer</option>
            <option value="tasks">Task Extractor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border bg-card text-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="border rounded-2xl bg-card shadow-subtle overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">No matching history entries found</p>
            <p className="text-xs text-muted-foreground">
              Adjust search queries or execute an automation task to record new activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                  <th className="py-3 px-4">Title & Overview</th>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium max-w-[280px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{job.title}</span>
                        {job.isDemo && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-normal shrink-0">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {job.inputSummary}
                      </div>
                      {job.errorMessage && (
                        <div className="text-[11px] text-red-600 mt-0.5 truncate">
                          {job.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs capitalize text-muted-foreground">
                      {job.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {job.result && (
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
                            title="Inspect Result"
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
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${job.title}"?`)) removeJob(job.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete from history"
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

      {/* Result Inspector Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-elevated">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">{selectedJob.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Tool: {selectedJob.type} • Created at {formatDate(selectedJob.createdAt)}
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
                  This result was generated using LazyFlow&apos;s deterministic demo logic.
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
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
