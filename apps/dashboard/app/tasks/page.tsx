import Link from "next/link";
import { fetchTasks } from "@/lib/api";

function statusColor(status: string) {
  switch (status) {
    case "CREATED":
      return "bg-blue-500/20 text-blue-400";
    case "PARSING":
      return "bg-purple-500/20 text-purple-400";
    case "PLANNING":
      return "bg-indigo-500/20 text-indigo-400";
    case "FAILED":
      return "bg-red-500/20 text-red-400";
    case "DEPLOYED":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

export default async function TasksPage() {
  let data;
  let error: string | null = null;

  try {
    data = await fetchTasks();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-sm text-[var(--muted)]">
            Engineering tickets ingested from ClickUp webhooks
          </p>
        </div>
        {data && (
          <span className="rounded-full bg-[var(--card)] px-3 py-1 text-sm text-[var(--muted)]">
            {data.total} total
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          <p className="font-medium">Could not load tasks</p>
          <p className="mt-1 text-sm">{error}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Make sure the API is running: <code>npm run dev:api</code>
          </p>
        </div>
      )}

      {data && data.tasks.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Send a ClickUp webhook or seed a dev task via{" "}
            <code className="rounded bg-black/30 px-1">POST /api/tasks/dev/seed</code>
          </p>
        </div>
      )}

      {data && data.tasks.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">ClickUp ID</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.tasks.map((task: {
                id: string;
                title: string;
                status: string;
                clickupTaskId: string;
                createdAt: string;
              }) => (
                <tr key={task.id} className="hover:bg-[var(--card)]/50">
                  <td className="px-4 py-3">
                    <Link href={`/tasks/${task.id}`} className="font-medium text-[var(--accent)] hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{task.clickupTaskId}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(task.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
