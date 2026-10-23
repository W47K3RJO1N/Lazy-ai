import Link from "next/link";
import {
  FileText,
  FolderTree,
  ListTodo,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Leaf,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { AIStatusIndicator } from "@/components/AIStatusIndicator";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-card/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sage-600 text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">LazyFlow AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <AIStatusIndicator className="hidden sm:inline-flex" />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200/80 text-xs font-semibold uppercase tracking-wider mx-auto mb-6">
          <Leaf className="w-3.5 h-3.5 text-sage-600" />
          Hacktoberfest Week 3 Challenge: Slow & Steady
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.15]">
          Stop managing busywork. <br className="hidden sm:inline" />
          <span className="text-sage-700">Start making progress.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          LazyFlow AI quietly handles document summaries, file organization, and task extraction—so your day feels lighter.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary-hover shadow-sm transition-all hover:scale-[1.01]"
          >
            Start automating
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-card border border-border text-foreground font-medium text-base hover:bg-muted/70 transition-colors"
          >
            Explore features
          </a>
        </div>

        {/* Real UI Interactive Preview Mockup */}
        <div className="mt-14 max-w-4xl mx-auto w-full text-left bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
          <div className="border-b px-4 py-3 bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-muted-foreground">lazyflow-agent-v1.local</span>
            </div>
            <span className="text-xs font-medium text-sage-700 bg-sage-100 px-2 py-0.5 rounded">Deterministic Engine Active</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-background/50 hover:border-sage-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm">Summarize Document</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Extracted 4 key takeaways from 24-page research paper.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved ~15 min</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/50 hover:border-sage-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center mb-3">
                <FolderTree className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm">Smart File Organizer</h4>
              <p className="text-xs text-muted-foreground mt-1">
                6 proposals generated: standard naming & destination paths.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Ready for review</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/50 hover:border-sage-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center mb-3">
                <ListTodo className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm">Task Extractor</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Converted raw team meeting notes into 3 actionable items.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Priorities assigned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-card border-t border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Three quiet automations for your daily workflow
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built to work with you, not overwhelm you. Everything runs safely with deterministic fallbacks or open-weight AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-background space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Document Summarizer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn lengthy PDFs and text docs into quick overviews, key takeaways, executive briefs, and study notes with zero fluff.
              </p>
              <ul className="text-xs space-y-2 text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  PDF text extraction & character stats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  5 tailored summarization styles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Export to .md or .txt anytime
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border bg-background space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Smart File Organizer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your cluttered download directory and get a transparent organization manifest with normalized filenames and safe folder proposals.
              </p>
              <ul className="text-xs space-y-2 text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Review every change before applying
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Sanitization against path traversal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Export JSON/CSV organization plans
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border bg-background space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Task Extractor</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paste rough thoughts, Slack messages, or meeting notes. LazyFlow structures them into prioritized tasks with explicit deadlines.
              </p>
              <ul className="text-xs space-y-2 text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Zod-validated JSON task structures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Clear distinction of inferred dates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  Interactive checklist & duration estimates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">How it works</h2>
          <p className="mt-2 text-muted-foreground">Three simple steps to save hours every week</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center text-lg mb-4">
              1
            </div>
            <h4 className="font-semibold text-base mb-2">Add a task or document</h4>
            <p className="text-sm text-muted-foreground">
              Drop in a PDF, select disorganized files, or paste messy raw notes into the tool.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center text-lg mb-4">
              2
            </div>
            <h4 className="font-semibold text-base mb-2">Let LazyFlow process it</h4>
            <p className="text-sm text-muted-foreground">
              Processed locally using deterministic heuristics or your configured open-weight model (Qwen/Gemma).
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center text-lg mb-4">
              3
            </div>
            <h4 className="font-semibold text-base mb-2">Review & apply results</h4>
            <p className="text-sm text-muted-foreground">
              Accept or reject file moves, check off items, or copy structured outputs with full control.
            </p>
          </div>
        </div>
      </section>

      {/* Open Innovation & Technology Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-medium mb-3">
                <Cpu className="w-3.5 h-3.5" />
                <span>Open Innovation & Ethics</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Built for privacy, self-hosting, and open-weight models
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Proprietary AI lock-in causes unpredictability and high energy consumption. LazyFlow AI connects cleanly to OpenAI-compatible endpoints hosting open-weight models (like Qwen or Gemma), or runs completely offline via its deterministic local engine.
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sage-700" />
                  <span>No persistent server database — history stored in your browser</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sage-700" />
                  <span>API keys are strictly server-side; never exposed to client bundles</span>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-card space-y-4">
              <h4 className="font-semibold text-sm">Deterministic Fallbacks Built-In</h4>
              <p className="text-xs text-muted-foreground">
                No API key? No problem. LazyFlow ships with a deterministic heuristic engine that extracts tasks, formats file structures, and parses documents locally.
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-[11px] text-muted-foreground">
                # Sample configuration (.env)<br />
                AI_API_BASE_URL=https://api.together.xyz/v1<br />
                AI_MODEL=Qwen/Qwen2.5-72B-Instruct<br />
                AI_API_KEY=your_key_here
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center text-xs text-muted-foreground bg-card">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-sage-600" />
            <span className="font-semibold text-foreground">LazyFlow AI</span>
            <span>— Hacktoberfest 2026 Open-Source AI Challenge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/settings" className="hover:underline">
              Settings & Privacy
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
