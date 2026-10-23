"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Cpu } from "lucide-react";
import { AIStatusResponse } from "@/types";
import { cn } from "@/lib/utils";

interface AIStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function AIStatusIndicator({ className, showDetails = false }: AIStatusIndicatorProps) {
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() =>
        setStatus({
          configured: false,
          model: "Local Deterministic",
          baseUrl: "None",
          mode: "demo",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground", className)}>
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-ping" />
        Checking provider...
      </div>
    );
  }

  const isDemo = status?.mode === "demo" || !status?.configured;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border",
          isDemo
            ? "bg-amber-50 text-amber-800 border-amber-200/90"
            : "bg-sage-100 text-sage-900 border-sage-300"
        )}
      >
        {isDemo ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Demo Mode (Local Engine)</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-sage-700" />
            <span>Active Provider: {status.model}</span>
          </>
        )}
      </div>

      {showDetails && isDemo && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          (No external API required • Deterministic simulation active)
        </span>
      )}
    </div>
  );
}
