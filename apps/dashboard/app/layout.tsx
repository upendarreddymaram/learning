import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dev Orchestrator",
  description: "ClickUp tasks ingested into the engineering delivery platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-lg font-semibold">AI Dev Orchestrator</h1>
              <p className="text-sm text-[var(--muted)]">Phase 1 — Task ingestion dashboard</p>
            </div>
            <nav className="flex gap-4 text-sm">
              <a href="/tasks" className="text-[var(--accent)] hover:underline">
                Tasks
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
