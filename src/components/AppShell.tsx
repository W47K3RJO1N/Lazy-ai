"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  ListTodo,
  History,
  Settings,
  Menu,
  X,
  Bot,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIStatusIndicator } from "@/components/AIStatusIndicator";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Document Summarizer", href: "/dashboard/summarizer", icon: FileText },
  { name: "Smart Organizer", href: "/dashboard/organizer", icon: FolderTree },
  { name: "Task Extractor", href: "/dashboard/tasks", icon: ListTodo },
  { name: "Activity History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-sage-900">
          <div className="w-8 h-8 rounded-lg bg-sage-500 text-white flex items-center justify-center shadow-subtle">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold">LazyFlow AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-card px-4 py-3 space-y-2">
          <div className="pb-2 border-b mb-2">
            <AIStatusIndicator />
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sage-100 text-sage-900 font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-sage-700" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/60 backdrop-blur-sm shrink-0">
        <div className="p-5 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-600 text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight">LazyFlow AI</span>
              <span className="block text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                Slow & Steady
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspaces
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sage-100/80 text-sage-900 font-semibold shadow-subtle"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isActive ? "text-sage-700 scale-105" : "text-muted-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t space-y-3">
          <div className="bg-sage-50 border border-sage-200/70 rounded-lg p-3 text-xs text-sage-900">
            <div className="flex items-center gap-1.5 font-semibold text-sage-800 mb-1">
              <Bot className="w-3.5 h-3.5" />
              <span>Personal Agent</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Automates busywork safely. Review proposals before applying changes.
            </p>
          </div>
          <AIStatusIndicator className="w-full justify-center" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
