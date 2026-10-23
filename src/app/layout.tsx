import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JobProvider } from "@/context/JobContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LazyFlow AI — Your Personal Automation Agent",
  description:
    "You relax. LazyFlow handles the busywork. Document summarization, file organization, and notes-to-tasks extraction powered by open-weight AI.",
  keywords: ["automation", "AI productivity", "summarizer", "file organizer", "task extractor", "open-source AI"],
  authors: [{ name: "LazyFlow AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <JobProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </JobProvider>
      </body>
    </html>
  );
}
