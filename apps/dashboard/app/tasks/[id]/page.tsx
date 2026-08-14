import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTask } from "@/lib/api";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchTask(id);

  if (!data) {
    notFound();
  }

  const { task, events } = data;

  return (
    <div>
      <Link href="/tasks" className="text-sm text-[var(--accent)] hover:underline">
        ← Back to tasks
      </Link>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <p className="mt-1 font-mono text-sm text-[var(--muted)]">ID: {task.id}</p>
          </div>
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
            {task.status}
          </span>
        </div>

        {task.description && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-[var(--muted)]">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-[var(--muted)]">ClickUp Task ID</h3>
            <p className="mt-1 font-mono text-sm">{task.clickupTaskId}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--muted)]">Created</h3>
            <p className="mt-1 text-sm">{new Date(task.createdAt).toLocaleString()}</p>
          </div>
          {task.clickupUrl && (
            <div className="sm:col-span-2">
              <h3 className="text-sm font-medium text-[var(--muted)]">ClickUp Link</h3>
              <a
                href={task.clickupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-[var(--accent)] hover:underline"
              >
                Open in ClickUp →
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Event Timeline</h3>
        <p className="text-sm text-[var(--muted)]">Audit log of webhook and system events</p>

        {events.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No events recorded.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {events.map((event: {
              id: string;
              type: string;
              createdAt: string;
              payload: Record<string, unknown> | null;
            }) => (
              <li
                key={event.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-[var(--accent)]">
                    {event.type}
                  </span>
                  <time className="text-xs text-[var(--muted)]">
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </div>
                {event.payload && (
                  <pre className="mt-3 max-h-48 overflow-auto rounded bg-black/30 p-3 text-xs text-[var(--muted)]">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {task.rawPayload && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-[var(--muted)]">
            Raw payload (debug)
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-xs">
            {JSON.stringify(task.rawPayload, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
