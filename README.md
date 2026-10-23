# LazyFlow AI — Your Personal Automation Agent

> **“You relax. LazyFlow handles the busywork.”**  
> *One quiet assistant. Less busywork. More breathing room.*

Built for the **Hacktoberfest Open-Source AI Challenge Week 3: “Slow and Steady.”**  
Theme: Pragmatic personal automation leveraging open-weight models (such as Qwen 2.5 and Gemma 2) and deterministic offline heuristics to eliminate repetitive digital tasks safely and conserve energy.

---

## 1. Overview & Architecture

LazyFlow AI is a production-quality productivity web application designed to help students, developers, and professionals automate their day-to-day busywork without giving up control:

1. **Document Summarizer:** Upload PDFs or paste text to generate quick overviews, key takeaways, executive briefs, and study notes with character count reduction metrics and Markdown/TXT exports.
2. **Smart File Organizer:** Inspect file metadata and generate safe, standardized folder structures and sanitized filenames. Export organization manifests (JSON/CSV) and bash migration scripts.
3. **Notes-to-Tasks Extractor:** Transform unstructured brainstorms and meeting transcripts into prioritized, editable tasks with explicit or inferred deadlines and duration estimates.
4. **Central Automation Queue & Activity History:** Manage jobs in a resilient browser-local queue with status recovery, transparent time-saved estimations, JSON backups, and full control.

### Dual-Engine AI Architecture

LazyFlow AI includes a provider abstraction with two operating modes:

- **Mode A — Real AI Mode:** Calls an OpenAI-compatible endpoint hosting open-weight models (e.g. Together AI, Groq, Ollama, vLLM, or OpenRouter). API secrets are strictly kept on the server inside Next.js serverless route handlers.
- **Mode B — Offline Demo Mode:** When no external API credentials are provided, LazyFlow operates deterministically using local heuristics. Results are clearly marked with a visible **Demo Mode** badge and provide contextual outputs derived from the actual inputs.

---

## 2. Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a curated calming sage palette:
  - Background: `#faf9f6` (warm off-white)
  - Primary: Sage Green (`#5e825e` / `#486748`)
  - Accent: Pale Mint & Warm Grays
  - Text: Deep Charcoal (`#222824`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Document Processing:** Server-side PDF text extraction via `pdf-parse`
- **Validation:** [Zod](https://zod.dev/) schemas for request validation and AI output enforcement
- **Toast Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Testing:** [Jest](https://jestjs.io/) and `ts-jest` for sanitization, security, and fallback verification
- **Deployment:** [Vercel](https://vercel.com/) (Serverless-ready, zero Python runtime dependency)

---

## 3. Application Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page introducing the Slow & Steady philosophy, UI preview, and open-weight tech |
| `/dashboard` | Central productivity overview with summary statistics, quick actions, and job queue |
| `/dashboard/summarizer` | PDF and text document summarizer with 5 tailored styles |
| `/dashboard/organizer` | File organization planner with path sanitization and manifest export |
| `/dashboard/tasks` | Unstructured notes to prioritized checklist extractor |
| `/dashboard/history` | Persistent activity history with search, type filters, and JSON export |
| `/settings` | AI provider inspection, connection diagnostics, env sample, and local privacy controls |

---

## 4. Local Installation & Setup

### Prerequisites
- Node.js `v18.17+` or `v20+` (tested on Node v24)
- npm or pnpm

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd hackweek3challange

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [https://lazy-ai-roan.vercel.app/](https://lazy-ai-roan.vercel.app/) in your browser. LazyFlow AI will start immediately in **Demo Mode** with realistic sample workflows.

---

## 5. AI Provider Configuration

To connect a live open-weight model endpoint:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Configure your provider details:
   ```env
   # OpenAI-compatible API URL
   AI_API_BASE_URL=https://api.together.xyz/v1

   # Secret Key (server-side only)
   AI_API_KEY=your_actual_api_key_here

   # Recommended Open-Weight Model
   AI_MODEL=Qwen/Qwen2.5-72B-Instruct
   ```
3. Restart the server (`npm run dev`). The status indicator will turn green and show **Active Provider**. You can also test the connection on `/settings`.

---

## 6. Running Tests & Production Build

```bash
# Run unit tests (Jest)
npm test

# Run production build
npm run build
```

---

## 7. Deploying to Vercel

1. Push your code to a GitHub/GitLab repository.
2. Import the project into [Vercel](https://vercel.com).
3. (Optional) Set the environment variables in the Vercel Dashboard under **Project Settings > Environment Variables**:
   - `AI_API_BASE_URL`
   - `AI_API_KEY`
   - `AI_MODEL`
4. Click **Deploy**. If environment variables are omitted, the deployed app works out-of-the-box in Demo Mode.

---

## 8. Security & Privacy Safeguards

- **Path Traversal Protection:** All filenames and folder paths proposed by the organizer undergo sanitization (`src/lib/sanitize.ts`) to prevent directory traversal (`../`) and forbidden control characters.
- **Client Safety Boundary:** Web browsers cannot silently move or rename local files on a computer. LazyFlow generates reviewable manifests and bash scripts rather than making false claims.
- **Serverless Secret Management:** `AI_API_KEY` is accessed exclusively in server-side route handlers (`/api/ai/*`) and is never leaked via client bundles or public endpoints.
- **Browser-Local Storage:** User history and jobs reside in the browser's `localStorage` and are not collected by any tracking databases.

---

## 9. Slow and Steady: Open Innovation

Proprietary models create vendor lock-in and high energy consumption. Open-weight models like **Qwen 2.5** and **Gemma 2** allow developers to host models on efficient hardware, enforce transparent safety boundaries, and eliminate unneeded API overhead.
