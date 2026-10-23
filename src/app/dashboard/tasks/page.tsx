"use client";

import React, { useState } from "react";
import {
  ListTodo,
  Sparkles,
  Trash2,
  Copy,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";
import { useJobs } from "@/context/JobContext";
import { TaskExtractionResult, TaskPriority } from "@/types";
import { toast } from "sonner";

const SAMPLE_NOTES = `Finish the project architecture report by Friday, revise chapter three of the distributed systems textbook, email the professor about the research deadline, and prepare slides before Monday's presentation.

Also remember to review pull requests from Alex, buy a USB-C hub, and back up the database snapshot sometime next week.`;

export default function TaskExtractorPage() {
  const { addJob, updateJob } = useJobs();
  const [notes, setNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<TaskExtractionResult | null>(null);

  const loadSampleNotes = () => {
    setNotes(SAMPLE_NOTES);
    toast.info("Sample unstructured notes loaded");
  };

  const handleExtract = async () => {
    if (!notes.trim()) {
      toast.error("Please enter or paste notes first");
      return;
    }

    setIsExtracting(true);
    const job = addJob({
      title: "Notes to Action Plan",
      type: "tasks",
      status: "processing",
      inputSummary: `${notes.length} characters of unstructured notes`,
    });

    try {
      const res = await fetch("/api/ai/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract tasks");
      }

      setResult(data);
      updateJob(job.id, {
        status: "completed",
        result: data,
        isDemo: data.isDemo,
      });

      toast.success(
        data.isDemo ? "Tasks extracted in Demo Mode" : "Action plan extracted successfully"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error extracting tasks";
      updateJob(job.id, {
        status: "failed",
        errorMessage: msg,
      });
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    if (!result) return;
    const updated = result.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setResult({ ...result, tasks: updated });
  };

  const updateTaskPriority = (taskId: string, priority: TaskPriority) => {
    if (!result) return;
    const updated = result.tasks.map((t) =>
      t.id === taskId ? { ...t, priority } : t
    );
    setResult({ ...result, tasks: updated });
  };

  const updateTaskTitle = (taskId: string, title: string) => {
    if (!result) return;
    const updated = result.tasks.map((t) =>
      t.id === taskId ? { ...t, title } : t
    );
    setResult({ ...result, tasks: updated });
  };

  const deleteTask = (taskId: string) => {
    if (!result) return;
    const updated = result.tasks.filter((t) => t.id !== taskId);
    setResult({ ...result, tasks: updated });
    toast.success("Task removed");
  };

  const copyTasksAsText = () => {
    if (!result) return;
    const text = result.tasks
      .map(
        (t) =>
          `[${t.completed ? "x" : " "}] [${t.priority}] ${t.title}${
            t.deadline ? ` (Due: ${t.deadline})` : ""
          }`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Tasks copied as markdown checklist");
  };

  const exportTasks = (format: "json" | "csv") => {
    if (!result) return;

    let content = "";
    let mimeType = "text/plain";

    if (format === "json") {
      content = JSON.stringify(result.tasks, null, 2);
      mimeType = "application/json";
    } else {
      content = "Title,Priority,Deadline,Estimated Duration,Category,Completed\n" +
        result.tasks
          .map(
            (t) =>
              `"${t.title}","${t.priority}","${t.deadline || ""}","${t.estimatedDuration || ""}","${t.category}",${t.completed}`
          )
          .join("\n");
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lazyflow_tasks.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported tasks as .${format}`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Notes-to-Tasks Extractor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convert scattered thoughts, meeting notes, and rough messages into structured, prioritized action plans.
          </p>
        </div>
        <button
          onClick={loadSampleNotes}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-muted transition-colors text-sage-800"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load sample notes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Raw Notes Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border rounded-xl bg-card p-4 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Raw Notes / Message Snippet
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {notes.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              rows={12}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste unstructured notes, meeting minutes, Slack transcripts, or brain dumps here..."
              className="w-full p-3.5 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none font-mono text-xs leading-relaxed"
            />
          </div>

          <button
            onClick={handleExtract}
            disabled={isExtracting || !notes.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting Action Items...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Prioritized Tasks
              </>
            )}
          </button>
        </div>

        {/* Right: Editable Tasks Output */}
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
                      {result.tasks.length} actionable items extracted. Edit titles or adjust priorities directly.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyTasksAsText}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground text-xs"
                      title="Copy as markdown checklist"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportTasks("json")}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground text-xs"
                      title="Export JSON"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => exportTasks("csv")}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground text-xs"
                      title="Export CSV"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {result.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border text-xs transition-colors space-y-2 ${
                        task.completed ? "bg-muted/30 border-muted opacity-60" : "bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompleted(task.id)}
                            className="mt-1 rounded border-border text-primary focus:ring-primary"
                          />
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                              className={`w-full font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none ${
                                task.completed ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            />
                            {task.description && (
                              <p className="text-[11px] text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-muted-foreground hover:text-red-600 p-1"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Badges / Metadata row */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t text-[11px] text-muted-foreground">
                        {/* Priority Selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">Priority:</span>
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              updateTaskPriority(task.id, e.target.value as TaskPriority)
                            }
                            className={`px-1.5 py-0.5 rounded font-medium text-[11px] border ${
                              task.priority === "High"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        {/* Deadline Badge */}
                        {task.deadline && (
                          <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{task.deadline}</span>
                            {task.isDeadlineInferred && (
                              <span className="text-[9px] text-muted-foreground">(inferred)</span>
                            )}
                          </div>
                        )}

                        {/* Duration */}
                        {task.estimatedDuration && (
                          <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{task.estimatedDuration}</span>
                          </div>
                        )}

                        <span className="bg-sage-100 text-sage-800 px-1.5 py-0.5 rounded">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                  <ListTodo className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-foreground">No Tasks Extracted Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Enter or paste rough notes on the left and click &quot;Extract Prioritized Tasks&quot; to transform them into an actionable, editable plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
