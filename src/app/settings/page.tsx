"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  Key,
  Trash2,
  RotateCw,
  Copy,
  Cpu,
  Lock,
} from "lucide-react";
import { AIStatusResponse } from "@/types";
import { useJobs } from "@/context/JobContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { clearAllJobs } = useJobs();
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => {
        setStatus({
          configured: false,
          model: "Local Deterministic",
          baseUrl: "None",
          mode: "demo",
        });
      });
  };

  const testProviderConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ai/status");
      const data = await res.json();
      if (data.configured) {
        setTestResult(`Success: Connected to ${data.model} at ${data.baseUrl}`);
        toast.success("AI Provider connection verified");
      } else {
        setTestResult("No external AI provider configured. Operating in safe Local Demo Mode.");
        toast.info("Operating in Demo Mode");
      }
    } catch {
      setTestResult("Error checking provider status.");
      toast.error("Failed to connect to AI provider");
    } finally {
      setTestingConnection(false);
    }
  };

  const copyEnvSample = () => {
    const envText = `# LazyFlow AI Configuration
# Point to any OpenAI-compatible provider (e.g. Together AI, vLLM, Ollama, Groq, OpenRouter)

AI_API_BASE_URL=https://api.together.xyz/v1
AI_API_KEY=your_secure_api_key_here
AI_MODEL=Qwen/Qwen2.5-72B-Instruct
`;
    navigator.clipboard.writeText(envText);
    toast.success("Sample .env configuration copied to clipboard");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all browser data and reset LazyFlow?")) {
      clearAllJobs();
      toast.success("Local storage purged");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Settings & AI Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect model status, configure open-weight endpoints, and manage local browser data.
        </p>
      </div>

      {/* AI Provider Status Card */}
      <div className="border rounded-2xl bg-card p-6 shadow-subtle space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Inference Engine Status</h2>
              <p className="text-xs text-muted-foreground">
                Current operational mode of LazyFlow AI
              </p>
            </div>
          </div>
          <button
            onClick={testProviderConnection}
            disabled={testingConnection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
            Test Connection
          </button>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Current Mode:</div>
            <div className="font-semibold mt-1 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.mode === "real" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="capitalize">{status?.mode || "Demo"} Mode</span>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Target Model:</div>
            <div className="font-semibold mt-1 truncate" title={status?.model}>
              {status?.model || "Local Heuristics Engine"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Endpoint Host:</div>
            <div className="font-semibold mt-1 truncate">
              {status?.baseUrl || "Local (Offline safe)"}
            </div>
          </div>
        </div>

        {testResult && (
          <div className="p-3 rounded-lg text-xs bg-muted border text-foreground font-mono">
            {testResult}
          </div>
        )}
      </div>

      {/* Real AI Setup Instructions */}
      <div className="border rounded-2xl bg-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Configuring Real AI Inference</h2>
              <p className="text-xs text-muted-foreground">
                Connect an open-weight model via any OpenAI-compatible provider
              </p>
            </div>
          </div>
          <button
            onClick={copyEnvSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy .env snippet
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          LazyFlow AI connects to any OpenAI-compatible chat completions endpoint (such as Together AI, Groq, Ollama, vLLM, or OpenRouter) supporting open-weight models like **Qwen 2.5** or **Gemma 2**.
        </p>

        <div className="p-3.5 rounded-xl bg-muted font-mono text-xs text-muted-foreground relative overflow-x-auto">
          <div># Set these in your .env.local file or Vercel Environment Variables</div>
          <div>AI_API_BASE_URL=https://api.together.xyz/v1</div>
          <div>AI_API_KEY=your_private_api_key</div>
          <div>AI_MODEL=Qwen/Qwen2.5-72B-Instruct</div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Lock className="w-3.5 h-3.5 text-sage-700" />
          <span>
            API keys are strictly managed on the server. They are never transmitted to client browsers or exposed in client bundles.
          </span>
        </div>
      </div>

      {/* Privacy & Storage */}
      <div className="border rounded-2xl bg-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Privacy & Local Storage</h2>
            <p className="text-xs text-muted-foreground">
              How LazyFlow AI handles your documents, notes, and activity
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p>
            • <strong>Browser-Local Persistence:</strong> Your automation jobs and activity history are stored in your browser&apos;s <code className="font-mono text-foreground">localStorage</code>. This data belongs exclusively to your device and is never automatically synced to external databases.
          </p>
          <p>
            • <strong>No Unsolicited Tracking:</strong> We do not log or retain document text on our servers. When an external AI provider is configured, request payloads are sent directly to that endpoint and are not saved in server files.
          </p>
          <p>
            • <strong>Storage Boundaries:</strong> LocalStorage is not encrypted at rest by the browser. Avoid storing unencrypted high-security credentials in notes.
          </p>
        </div>

        <div className="pt-3 border-t flex justify-end">
          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Local Browser History
          </button>
        </div>
      </div>
    </div>
  );
}
